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

export async function getAllOrders(filters?: { status?: string; search?: string }) {
  await assertAdmin()

  return prisma.order.findMany({
    where: {
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.search && {
        user: {
          email: { contains: filters.search, mode: 'insensitive' },
        },
      }),
    },
    select: {
      id: true,
      order_date: true,
      total_amount: true,
      status: true,
      user: { select: { email: true, name: true } },
      payment: { select: { status: true, transaction_id: true } },
      _count: { select: { order_items: true } },
    },
    orderBy: { order_date: 'desc' },
  })
}

export async function getOrderDetail(orderId: string) {
  await assertAdmin()

  return prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      order_date: true,
      total_amount: true,
      status: true,
      user: { select: { email: true, name: true, id: true } },
      payment: { select: { id: true, status: true, transaction_id: true, amount: true } },
      order_items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: { select: { name: true, image_url: true } },
        },
      },
    },
  })
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED'
): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { success: false, error: 'Commande non trouvée.' }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    })

    await logAdminAction({
      adminId,
      action: 'update_order_status',
      resourceType: 'Order',
      resourceId: orderId,
      changes: { old_status: order.status, new_status: newStatus },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true, message: `Statut de la commande changé en ${newStatus}.` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { success: false, error: 'Commande non trouvée.' }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    })

    await logAdminAction({
      adminId,
      action: 'cancel_order',
      resourceType: 'Order',
      resourceId: orderId,
      metadata: { previous_status: order.status },
    })

    revalidatePath('/admin/orders')
    return { success: true, message: 'Commande annulée.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
