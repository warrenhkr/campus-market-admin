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

export async function getAllUsers(filters?: { role?: string; search?: string }) {
  await assertAdmin()

  return prisma.user.findMany({
    where: {
      ...(filters?.role && { role: filters.role as any }),
      ...(filters?.search && {
        OR: [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar_url: true,
      role: true,
      created_at: true,
      seller: { select: { id: true, shop_name: true } },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function updateUserRole(
  userId: string,
  newRole: 'USER' | 'SELLER' | 'ADMIN'
): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: 'Utilisateur non trouvé.' }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    await logAdminAction({
      adminId,
      action: 'change_role',
      resourceType: 'User',
      resourceId: userId,
      changes: { old_role: user.role, new_role: newRole },
    })

    revalidatePath('/admin/users')
    return { success: true, message: `Rôle de ${user.email} changé en ${newRole}.` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function suspendUser(userId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: 'Utilisateur non trouvé.' }

    await logAdminAction({
      adminId,
      action: 'suspend_user',
      resourceType: 'User',
      resourceId: userId,
      metadata: { email: user.email },
    })

    revalidatePath('/admin/users')
    return {
      success: true,
      message: `${user.email} a été suspendu. (Action non implémentée côté auth)`,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: 'Utilisateur non trouvé.' }

    // Cascade delete via Prisma
    await prisma.user.delete({ where: { id: userId } })

    await logAdminAction({
      adminId,
      action: 'delete_user',
      resourceType: 'User',
      resourceId: userId,
      metadata: { email: user.email, role: user.role },
    })

    revalidatePath('/admin/users')
    return { success: true, message: `${user.email} a été supprimé définitivement.` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
