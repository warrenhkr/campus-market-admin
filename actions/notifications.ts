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

export async function createNotification({
  type, title, message, metadata = {},
}: {
  type: string
  title: string
  message: string
  metadata?: Record<string, unknown>
}): Promise<ActionResult> {
  try {
    await assertAdmin()
    await prisma.notification.create({
      data: { type, title, message, metadata },
    })
    revalidatePath('/admin/notifications')
    return { success: true, message: 'Notification créée.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getNotifications(onlyUnread = false) {
  await assertAdmin()
  return prisma.notification.findMany({
    where: onlyUnread ? { is_read: false } : undefined,
    orderBy: { created_at: 'desc' },
    take: 50,
  })
}

export async function getUnreadCount(): Promise<number> {
  await assertAdmin()
  return prisma.notification.count({ where: { is_read: false } })
}

export async function markAsRead(id: string): Promise<ActionResult> {
  try {
    await assertAdmin()
    await prisma.notification.update({ where: { id }, data: { is_read: true } })
    revalidatePath('/admin/notifications')
    return { success: true, message: 'Notification marquée comme lue.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function markAllAsRead(): Promise<ActionResult> {
  try {
    await assertAdmin()
    await prisma.notification.updateMany({ where: { is_read: false }, data: { is_read: true } })
    revalidatePath('/admin/notifications')
    return { success: true, message: 'Toutes les notifications marquées comme lues.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteNotification(id: string): Promise<ActionResult> {
  try {
    await assertAdmin()
    await prisma.notification.delete({ where: { id } })
    revalidatePath('/admin/notifications')
    return { success: true, message: 'Notification supprimée.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}