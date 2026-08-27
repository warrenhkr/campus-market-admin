'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getFedaPayPayoutConfig } from '@/lib/fedapay'
import { logAdminAction } from '@/lib/audit'

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string }

async function assertAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Accès refusé.')
}

export async function getFinancialKPIs() {
  await assertAdmin()

  const [totals, byStatus, ordersCount, availableLedger, pendingLedger] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'CAPTURED' },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.order.count(),
    prisma.commissionEntry.aggregate({
      where: { status: 'AVAILABLE' },
      _sum: { platform_fee: true, seller_earning: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'PENDING' },
      _sum: { platform_fee: true },
    }),
  ])

  const refundedTotal = byStatus.find(s => s.status === 'REFUNDED')?._sum.amount ?? 0
  const failedCount = byStatus.find(s => s.status === 'FAILED')?._count.id ?? 0
  const successfulPayments = byStatus.find(s => s.status === 'CAPTURED')?._count.id ?? 0

  return {
    totalRevenue:   Number(totals._sum.amount ?? 0),
    platformFee:    Number(availableLedger._sum.platform_fee ?? 0),
    platformFees:   Number(availableLedger._sum.platform_fee ?? 0),
    sellerEarnings: Number(availableLedger._sum.seller_earning ?? 0),
    pendingPlatformFees: Number(pendingLedger._sum.platform_fee ?? 0),
    availablePlatformFees: Number(availableLedger._sum.platform_fee ?? 0),
    totalRefunded:  Number(refundedTotal),
    failedCount:    Number(failedCount),
    successfulPayments: Number(successfulPayments),
    ordersCount,
  }
}

export async function getMonthlyRevenue() {
  await assertAdmin()
  const rows = await prisma.$queryRaw<
    { month: string; revenue: number; fees: number }[]
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') AS month,
      SUM(amount)::float       AS revenue,
      SUM(platform_fee)::float AS fees
    FROM public.payments
    WHERE status = 'CAPTURED'::"payment_status"
      AND paid_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', paid_at)
    ORDER BY DATE_TRUNC('month', paid_at) ASC
  `
  return rows
}

export async function getPayments(page = 1, pageSize = 20) {
  await assertAdmin()
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            user: { select: { name: true, email: true } },
            order_items: {
              select: { product: { select: { shop: { select: { name: true } } } } },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.payment.count(),
  ])
  return { payments, total, pages: Math.ceil(total / pageSize) }
}

export async function getWithdrawals() {
  await assertAdmin()
  const withdrawals = await prisma.withdrawal.findMany({
    where: { status: { in: ['PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED', 'REJECTED'] } },
    include: {
      seller: { select: { shop_name: true, user: { select: { name: true, email: true } } } },
    },
    orderBy: { created_at: 'desc' },
    take: 50,
  })

  return withdrawals.map((withdrawal) => ({
    ...withdrawal,
    amount: Number(withdrawal.amount),
  }))
}

export async function updateWithdrawalStatus(
  withdrawalId: string,
  status: 'APPROVED' | 'REJECTED',
): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      select: {
        id: true,
        seller_id: true,
        amount: true,
        status: true,
        method: true,
        account: true,
        seller: { select: { shop_name: true, user: { select: { name: true, email: true } } } },
      },
    })
    if (!withdrawal) return { success: false, error: 'Demande introuvable.' }
    if (withdrawal.status !== 'PENDING') return { success: false, error: 'Cette demande a déjà été traitée.' }

    if (status === 'APPROVED') {
      const [available, reserved] = await Promise.all([
        prisma.commissionEntry.aggregate({
          where: { shop: { seller_id: withdrawal.seller_id }, status: 'AVAILABLE' },
          _sum: { seller_earning: true },
        }),
        prisma.withdrawal.aggregate({
          where: {
            seller_id: withdrawal.seller_id,
            status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] },
            id: { not: withdrawal.id },
          },
          _sum: { amount: true },
        }),
      ])
      const balance = Number(available._sum.seller_earning ?? 0) - Number(reserved._sum.amount ?? 0)
      if (Number(withdrawal.amount) > balance) {
        return { success: false, error: 'Solde vendeur insuffisant pour approuver cette demande.' }
      }
    }

    if (status === 'REJECTED') {
      const rejected = await prisma.withdrawal.updateMany({
        where: { id: withdrawal.id, status: 'PENDING' },
        data: { status, processed_at: new Date() },
      })
      if (rejected.count === 0) return { success: false, error: 'Cette demande a déjà été traitée.' }
      await logAdminAction({ adminId, action: 'reject_seller_withdrawal', resourceType: 'Withdrawal', resourceId: withdrawal.id })
      revalidatePath('/admin/finance')
      return { success: true, message: 'Demande refusée.' }
    }

    const { apiUrl, secretKey } = getFedaPayPayoutConfig()
    if (!secretKey) return { success: false, error: 'Clé secrète FedaPay absente.' }

    const account = withdrawal.account
    const rawAccount = account && typeof account === 'object' && 'raw' in account ? String(account.raw) : ''
    const phone = rawAccount.replace(/\s+/g, '')
    if (!phone) return { success: false, error: 'Numéro Mobile Money manquant.' }

    const claimed = await prisma.withdrawal.updateMany({
      where: { id: withdrawal.id, status: 'PENDING' },
      data: { status: 'PROCESSING' },
    })
    if (claimed.count === 0) return { success: false, error: 'Cette demande a déjà été traitée.' }

    const payoutResponse = await fetch(`${apiUrl}/payouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secretKey}` },
      body: JSON.stringify({
        amount: Math.round(Number(withdrawal.amount)),
        currency: { iso: 'XOF' },
        mode: withdrawal.method === 'MOOV' ? 'moov_open' : 'mtn_open',
        description: `Retrait vendeur ${withdrawal.seller.shop_name}`,
        recipient: {
          name: withdrawal.seller.user.name ?? withdrawal.seller.shop_name,
          phone_number: { number: phone, country: 'BJ' },
        },
        merchant_reference: `WD-${withdrawal.id}`,
        custom_metadata: { withdrawal_id: withdrawal.id, type: 'seller_withdrawal' },
      }),
    })
    const payoutData = await payoutResponse.json()
    if (!payoutResponse.ok) {
      await prisma.withdrawal.updateMany({ where: { id: withdrawal.id, status: 'PROCESSING' }, data: { status: 'PENDING' } })
      return { success: false, error: payoutData?.message ?? 'FedaPay a refusé le payout.' }
    }

    const payout = payoutData?.payout ?? payoutData?.data ?? payoutData
    if (!payout?.id) {
      await prisma.withdrawal.updateMany({ where: { id: withdrawal.id, status: 'PROCESSING' }, data: { status: 'PENDING' } })
      return { success: false, error: 'FedaPay n’a pas renvoyé d’identifiant de payout.' }
    }

    const startResponse = await fetch(`${apiUrl}/payouts/start`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secretKey}` },
      body: JSON.stringify([{ id: payout.id }]),
    })
    const startData = await startResponse.json()
    if (!startResponse.ok) return { success: false, error: startData?.message ?? 'Le payout n’a pas pu être démarré.' }

    await prisma.withdrawal.updateMany({
      where: { id: withdrawal.id, status: 'PROCESSING' },
      data: { status: 'PROCESSING', provider_id: String(payout.id), processed_at: new Date() },
    })
    await logAdminAction({
      adminId,
      action: 'start_seller_withdrawal_payout',
      resourceType: 'Withdrawal',
      resourceId: withdrawal.id,
      metadata: { provider_id: String(payout.id), amount: Number(withdrawal.amount) },
    })
    revalidatePath('/admin/finance')
    return { success: true, message: 'Payout FedaPay démarré. Le retrait est en cours de traitement.' }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' }
  }
}

export async function syncWithdrawalStatus(withdrawalId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      select: { id: true, status: true, provider_id: true },
    })
    if (!withdrawal) return { success: false, error: 'Demande introuvable.' }
    if (withdrawal.status !== 'PROCESSING' || !withdrawal.provider_id) {
      return { success: false, error: 'Ce retrait ne possède pas de payout en cours.' }
    }

    const { apiUrl, secretKey } = getFedaPayPayoutConfig()
    if (!secretKey) return { success: false, error: 'Clé secrète FedaPay absente.' }
    const response = await fetch(`${apiUrl}/payouts/${encodeURIComponent(withdrawal.provider_id)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const payload = await response.json()
    if (!response.ok) return { success: false, error: payload?.message ?? 'Statut FedaPay indisponible.' }

    const payout = payload?.payout ?? payload?.data ?? payload
    const providerStatus = String(payout?.status ?? '').toLowerCase()
    const nextStatus = providerStatus === 'sent'
      ? 'PAID'
      : providerStatus === 'failed'
        ? 'FAILED'
        : 'PROCESSING'

    if (nextStatus !== withdrawal.status) {
      await prisma.withdrawal.updateMany({
        where: { id: withdrawal.id, status: 'PROCESSING' },
        data: { status: nextStatus, processed_at: new Date() },
      })
      await logAdminAction({
        adminId,
        action: 'sync_seller_withdrawal_payout',
        resourceType: 'Withdrawal',
        resourceId: withdrawal.id,
        metadata: { provider_id: withdrawal.provider_id, provider_status: providerStatus, status: nextStatus },
      })
    }
    revalidatePath('/admin/finance')
    return { success: true, message: `Statut synchronisé : ${nextStatus}.` }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' }
  }
}

export async function initiateRefund(paymentId: string): Promise<ActionResult> {
  try {
    await assertAdmin()
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, transaction_id: true, amount: true, status: true, order: { select: { id: true } } },
    })
    if (!payment) return { success: false, error: 'Paiement introuvable.' }
    if (payment.status !== 'CAPTURED') {
      return { success: false, error: 'Seuls les paiements CAPTURED peuvent être remboursés.' }
    }

    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: 'REFUNDED' } }),
      prisma.order.update({ where: { id: payment.order.id }, data: { status: 'CANCELLED' } }),
    ])

    revalidatePath('/admin/finance')
    return {
      success: true,
      message: `Remboursement de ${Number(payment.amount).toLocaleString()} FCFA initié.`,
    }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' }
  }
}
