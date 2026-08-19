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

export async function getSettings() {
  await assertAdmin()

  return prisma.setting.findMany({
    orderBy: [{ category: 'asc' }, { key: 'asc' }],
  })
}

export async function updateSetting(key: string, value: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()
    const setting = await prisma.setting.findUnique({ where: { key } })
    if (!setting) return { success: false, error: 'Parametre introuvable.' }

    await prisma.setting.update({
      where: { key },
      data: { value },
    })

    await logAdminAction({
      adminId,
      action: 'update_setting',
      resourceType: 'Setting',
      resourceId: setting.id,
      changes: { key, old_value: setting.value, new_value: value },
    })

    revalidatePath('/admin/settings')
    return { success: true, message: 'Parametre mis a jour.' }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}
