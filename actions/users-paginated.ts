'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit'
import { calculatePagination, getPaginationResult, SortOrder, parseSortOrder, buildOrderBy } from '@/lib/pagination'
import { paginationSchema, userUpdateSchema } from '@/lib/validation'
import { z } from 'zod'

export type ActionResult =
  | { success: true; message: string; data?: any }
  | { success: false; error: string }

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Accès refusé.')
  return user.id
}

// Schémas de filtrage
const getUsersFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(255).optional(),
  role: z.enum(['USER', 'SELLER', 'ADMIN']).optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

type GetUsersFilter = z.infer<typeof getUsersFilterSchema>

export async function getUsersPaginated(
  filters: unknown,
): Promise<PaginatedResponse<any>> {
  await assertAdmin()

  const parsed = getUsersFilterSchema.parse(filters)
  const { skip, take } = calculatePagination(parsed.page, parsed.limit)

  const whereClause: any = {}

  if (parsed.role) {
    whereClause.role = parsed.role
  }

  if (parsed.search) {
    whereClause.OR = [
      { email: { contains: parsed.search, mode: 'insensitive' } },
      { name: { contains: parsed.search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        avatar_url: true,
        role: true,
        created_at: true,
        seller: { select: { id: true, shop_name: true } },
      },
      orderBy: { [parsed.sortBy]: buildOrderBy(parsed.sortBy, parseSortOrder(parsed.sortOrder)) },
      skip,
      take,
    }),
    prisma.user.count({ where: whereClause }),
  ])

  return {
    data: users,
    pagination: getPaginationResult(total, parsed.page, parsed.limit),
  }
}

// Export pour compatibilité ancienne API
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
  newRole: 'USER' | 'SELLER' | 'ADMIN',
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

    // Soft delete: mark user as inactive
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'USER' }, // Reset role
    })

    await logAdminAction({
      adminId,
      action: 'suspend_user',
      resourceType: 'User',
      resourceId: userId,
      changes: { suspended: true },
    })

    revalidatePath('/admin/users')
    return { success: true, message: `Utilisateur ${user.email} suspendu.` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: 'Utilisateur non trouvé.' }

    await prisma.user.delete({ where: { id: userId } })

    await logAdminAction({
      adminId,
      action: 'delete_user',
      resourceType: 'User',
      resourceId: userId,
      changes: { email: user.email },
    })

    revalidatePath('/admin/users')
    return { success: true, message: `Utilisateur ${user.email} supprimé.` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
