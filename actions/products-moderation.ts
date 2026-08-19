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

export async function approveProduct(productId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: { include: { seller: true } } }
    })
    if (!product) return { success: false, error: 'Produit non trouvé.' }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { status: 'APPROVED' },
      })

      if (product.shop?.seller?.user_id) {
        await tx.notification.create({
          data: {
            user_id: product.shop.seller.user_id,
            type: 'PRODUCT_APPROVED',
            title: 'Produit approuvé',
            message: `Votre produit "${product.name}" a été approuvé.`,
            metadata: { productId: product.id },
          }
        })
      }
    })

    await logAdminAction({
      adminId,
      action: 'approve_product',
      resourceType: 'Product',
      resourceId: productId,
      metadata: { name: product.name },
    })

    revalidatePath('/admin/products')
    return { success: true, message: `"${product.name}" approuvé.` }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function rejectProduct(
  productId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: { include: { seller: true } } }
    })
    if (!product) return { success: false, error: 'Produit non trouvé.' }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { status: 'REJECTED' },
      })

      if (product.shop?.seller?.user_id) {
        await tx.notification.create({
          data: {
            user_id: product.shop.seller.user_id,
            type: 'PRODUCT_REJECTED',
            title: 'Produit rejeté',
            message: reason
              ? `Votre produit "${product.name}" a été rejeté. Motif : ${reason}`
              : `Votre produit "${product.name}" a été rejeté.`,
            metadata: { productId: product.id, reason },
          }
        })
      }
    })

    await logAdminAction({
      adminId,
      action: 'reject_product',
      resourceType: 'Product',
      resourceId: productId,
      metadata: { name: product.name, reason },
    })

    revalidatePath('/admin/products')
    return { success: true, message: `"${product.name}" rejeté.` }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function hideProduct(productId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return { success: false, error: 'Produit non trouvé.' }

    await prisma.product.update({
      where: { id: productId },
      data: { status: 'HIDDEN' },
    })

    await logAdminAction({
      adminId,
      action: 'hide_product',
      resourceType: 'Product',
      resourceId: productId,
      metadata: { name: product.name },
    })

    revalidatePath('/admin/products')
    return { success: true, message: `"${product.name}" masqué.` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return { success: false, error: 'Produit non trouvé.' }

    await prisma.product.delete({ where: { id: productId } })

    await logAdminAction({
      adminId,
      action: 'delete_product',
      resourceType: 'Product',
      resourceId: productId,
      metadata: { name: product.name, shop_id: product.shop_id },
    })

    revalidatePath('/admin/products')
    return { success: true, message: `"${product.name}" supprimé.` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
