'use server'

import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Non authentifié.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Accès refusé.')
  return user.id
}

export async function getAllVendors() {
  await assertAdmin()
  return prisma.seller.findMany({
    include: {
      user: { select: { email: true, name: true, created_at: true } },
      shops: { select: { name: true, slug: true } },
    },
    orderBy: { created_at: 'desc' },
  })
}