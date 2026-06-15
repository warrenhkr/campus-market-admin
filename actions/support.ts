'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'
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

export async function getAllTickets(filters?: { status?: string; category?: string }) {
  await assertAdmin()

  return prisma.supportTicket.findMany({
    where: {
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.category && { category: filters.category as any }),
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      assignee: { select: { id: true, email: true, name: true } },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function getTicketDetail(ticketId: string) {
  await assertAdmin()
  return prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: true,
      assignee: true,
      replies: {
        include: { user: true },
        orderBy: { created_at: 'asc' },
      },
    },
  })
}

export async function assignTicket(ticketId: string, adminId: string): Promise<ActionResult> {
  try {
    const currentAdminId = await assertAdmin()

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) return { success: false, error: 'Ticket non trouvé.' }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assigned_to: adminId, status: 'IN_PROGRESS' },
    })

    await logAdminAction({
      adminId: currentAdminId,
      action: 'assign_ticket',
      resourceType: 'SupportTicket',
      resourceId: ticketId,
      metadata: { assigned_to: adminId },
    })

    revalidatePath('/admin/support')
    return { success: true, message: 'Ticket assigné.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function replyToTicket(
  ticketId: string,
  message: string,
  isInternal = false
): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) return { success: false, error: 'Ticket non trouvé.' }

    await prisma.supportTicketReply.create({
      data: {
        ticket_id: ticketId,
        user_id: adminId,
        message,
        is_internal: isInternal,
      },
    })

    await logAdminAction({
      adminId,
      action: 'reply_to_ticket',
      resourceType: 'SupportTicket',
      resourceId: ticketId,
      metadata: { is_internal: isInternal },
    })

    revalidatePath('/admin/support')
    return { success: true, message: 'Réponse ajoutée.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function closeTicket(ticketId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) return { success: false, error: 'Ticket non trouvé.' }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED', resolved_at: new Date() },
    })

    await logAdminAction({
      adminId,
      action: 'close_ticket',
      resourceType: 'SupportTicket',
      resourceId: ticketId,
    })

    revalidatePath('/admin/support')
    return { success: true, message: 'Ticket fermé.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
