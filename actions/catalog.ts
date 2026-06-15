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

export async function getCategories() {
  await assertAdmin()
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })
}

export async function createCategory(name: string): Promise<ActionResult> {
  try {
    await assertAdmin()
    const trimmed = name.trim()
    if (!trimmed) return { success: false, error: 'Le nom est obligatoire.' }
    const slug = trimmed.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    await prisma.category.create({ data: { name: trimmed, slug } })
    revalidatePath('/admin/catalog')
    return { success: true, message: `Catégorie "${trimmed}" créée.` }
  } catch (err: any) {
    if (err.code === 'P2002') return { success: false, error: 'Ce nom existe déjà.' }
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function updateCategory(id: string, name: string): Promise<ActionResult> {
  try {
    await assertAdmin()
    const trimmed = name.trim()
    if (!trimmed) return { success: false, error: 'Le nom est obligatoire.' }
    const slug = trimmed.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    await prisma.category.update({ where: { id }, data: { name: trimmed, slug } })
    revalidatePath('/admin/catalog')
    return { success: true, message: `Catégorie renommée en "${trimmed}".` }
  } catch (err: any) {
    if (err.code === 'P2002') return { success: false, error: 'Ce nom existe déjà.' }
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await assertAdmin()
    const count = await prisma.product.count({ where: { category_id: id } })
    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/catalog')
    return {
      success: true,
      message: count > 0 ? `Catégorie supprimée. ${count} produit(s) sans catégorie.` : 'Catégorie supprimée.',
    }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function getAllProducts(filters?: {
  categoryId?: string
  available?: boolean
  search?: string
}) {
  await assertAdmin()
  return prisma.product.findMany({
    where: {
      ...(filters?.categoryId && { category_id: filters.categoryId }),
      ...(filters?.available !== undefined && { is_available: filters.available }),
      ...(filters?.search && { name: { contains: filters.search, mode: 'insensitive' } }),
    },
    include: {
      shop: { select: { name: true, slug: true } },
      category: { select: { name: true } },
      _count: { select: { reviews: true, order_items: true } },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function toggleProductVisibility(productId: string, isAvailable: boolean): Promise<ActionResult> {
  try {
    await assertAdmin()
    const product = await prisma.product.update({
      where: { id: productId },
      data: { is_available: isAvailable },
      select: { name: true },
    })
    revalidatePath('/admin/catalog')
    return {
      success: true,
      message: isAvailable ? `"${product.name}" visible.` : `"${product.name}" masqué.`,
    }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function getAllShops() {
  await assertAdmin()
  return prisma.shop.findMany({
    include: {
      seller: {
        select: {
          shop_name: true,
          verification_status: true,
          subscription_expires_at: true,
          user: { select: { name: true, email: true } },
        },
      },
      _count: { select: { products: true } },
    },
    orderBy: { created_at: 'desc' },
  })
}