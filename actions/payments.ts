'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit'

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string }

async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Accès refusé.')
  return user.id
}

export async function getAllPayments(filters?: { status?: string }) {
  await assertAdmin()

  return prisma.payment.findMany({
    where: {
      ...(filters?.status && { status: filters.status as any }),
    },
    select: {
      id: true,
      order_id: true,
      amount: true,
      platform_fee: true,
      seller_earning: true,
      currency: true,
      method: true,
      transaction_id: true,
      status: true,
      paid_at: true,
      created_at: true,
      order: {
        select: {
          user: { select: { email: true } },
          order_items: { select: { product: { select: { shop: { select: { seller: { select: { shop_name: true } } } } } } } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function getPaymentDetail(paymentId: string) {
  await assertAdmin()

  return prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      order_id: true,
      amount: true,
      platform_fee: true,
      seller_earning: true,
      currency: true,
      method: true,
      transaction_id: true,
      status: true,
      paid_at: true,
      created_at: true,
      updated_at: true,
      order: {
        select: {
          id: true,
          user: { select: { email: true, name: true } },
          total_amount: true,
          status: true,
          order_items: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: {
                  name: true,
                  shop: { select: { seller: { select: { shop_name: true } } } },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function initiateRefund(paymentId: string, reason?: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment) return { success: false, error: 'Paiement non trouvé.' }

    if (payment.status !== 'CAPTURED') {
      return { success: false, error: 'Seuls les paiements capturés peuvent être remboursés.' }
    }

    // Marquer comme REFUNDED
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    })

    await logAdminAction({
      adminId,
      action: 'initiate_refund',
      resourceType: 'Payment',
      resourceId: paymentId,
      metadata: { amount: payment.amount, reason },
    })

    revalidatePath('/admin/payments')
    return { success: true, message: 'Remboursement initié.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getPaymentStats() {
  await assertAdmin()

  const [totalProcessed, totalPending, totalRefunded] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'CAPTURED' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'PENDING' },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: 'REFUNDED' },
      _sum: { amount: true },
    }),
  ])

  return {
    totalProcessed: totalProcessed._sum.amount || 0,
    totalPending: totalPending._count,
    totalRefunded: totalRefunded._sum.amount || 0,
  }
}
