'use server'

import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifie.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Acces refuse.')
}

export async function getAdminLogs(filters?: {
  action?: string
  resourceType?: string
  search?: string
}) {
  await assertAdmin()

  return prisma.adminLog.findMany({
    where: {
      ...(filters?.action && { action: { contains: filters.action, mode: 'insensitive' } }),
      ...(filters?.resourceType && { resource_type: filters.resourceType }),
      ...(filters?.search && {
        OR: [
          { action: { contains: filters.search, mode: 'insensitive' } },
          { resource_type: { contains: filters.search, mode: 'insensitive' } },
          { user: { email: { contains: filters.search, mode: 'insensitive' } } },
          { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
    },
    orderBy: { created_at: 'desc' },
    take: 200,
  })
}
