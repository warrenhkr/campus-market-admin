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

export async function getAllShops(filters?: { search?: string; suspended?: string }) {
  await assertAdmin()

  const shops = await prisma.shop.findMany({
    where: {
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { slug: { contains: filters.search, mode: 'insensitive' } },
          { seller: { shop_name: { contains: filters.search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      seller: {
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      },
      _count: { select: { products: true } },
      products: { select: { is_available: true, stock: true } },
    },
    orderBy: { created_at: 'desc' },
  })

  return shops
    .map((shop) => {
      const availableProducts = shop.products.filter((product) => product.is_available).length
      const isSuspended = shop.products.length > 0 && availableProducts === 0

      return {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        created_at: shop.created_at,
        seller: shop.seller,
        productCount: shop._count.products,
        lowStockCount: shop.products.filter((product) => product.stock <= 3).length,
        isSuspended,
      }
    })
    .filter((shop) => {
      if (filters?.suspended === 'true') return shop.isSuspended
      if (filters?.suspended === 'false') return !shop.isSuspended
      return true
    })
}

export async function toggleShopSuspension(shopId: string, suspend: boolean): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()
    const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { name: true } })
    if (!shop) return { success: false, error: 'Boutique introuvable.' }

    await prisma.product.updateMany({
      where: { shop_id: shopId },
      data: { is_available: !suspend },
    })

    await logAdminAction({
      adminId,
      action: suspend ? 'suspend_shop' : 'activate_shop',
      resourceType: 'Shop',
      resourceId: shopId,
      metadata: { name: shop.name },
    })

    revalidatePath('/admin/shops')
    return {
      success: true,
      message: suspend ? 'Boutique suspendue.' : 'Boutique reactivee.',
    }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}
