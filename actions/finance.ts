'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  const [totals, byStatus, ordersCount] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'CAPTURED' },
      _sum: { amount: true, platform_fee: true, seller_earning: true },
    }),
    prisma.payment.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.order.count(),
  ])

  const refundedTotal = byStatus.find(s => s.status === 'REFUNDED')?._sum.amount ?? 0
  const failedCount = byStatus.find(s => s.status === 'FAILED')?._count.id ?? 0
  const successfulPayments = byStatus.find(s => s.status === 'CAPTURED')?._count.id ?? 0

  return {
    totalRevenue:   Number(totals._sum.amount ?? 0),
    platformFee:    Number(totals._sum.platform_fee ?? 0),
    platformFees:   Number(totals._sum.platform_fee ?? 0),
    sellerEarnings: Number(totals._sum.seller_earning ?? 0),
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
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}
