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
  if (!user) throw new Error('Non authentifie.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Acces refuse.')
  return user.id
}

export async function getSystemAlerts(filters?: { unread?: boolean; severity?: string }) {
  await assertAdmin()

  return prisma.systemAlert.findMany({
    where: {
      ...(filters?.unread && { is_read: false }),
      ...(filters?.severity && { severity: filters.severity as any }),
    },
    orderBy: { created_at: 'desc' },
    take: 100,
  })
}

export async function markSystemAlertAsRead(alertId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()
    await prisma.systemAlert.update({ where: { id: alertId }, data: { is_read: true } })
    await logAdminAction({
      adminId,
      action: 'mark_alert_read',
      resourceType: 'SystemAlert',
      resourceId: alertId,
    })
    revalidatePath('/admin/alerts')
    revalidatePath('/admin/dashboard')
    return { success: true, message: 'Alerte marquee comme lue.' }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function dismissSystemAlert(alertId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()
    await prisma.systemAlert.update({
      where: { id: alertId },
      data: { is_read: true, dismissed_at: new Date() },
    })
    await logAdminAction({
      adminId,
      action: 'dismiss_alert',
      resourceType: 'SystemAlert',
      resourceId: alertId,
    })
    revalidatePath('/admin/alerts')
    revalidatePath('/admin/dashboard')
    return { success: true, message: 'Alerte masquee.' }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}
