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

export async function getAllReviews(filters?: { rating?: number; hidden?: boolean }) {
  await assertAdmin()

  return prisma.review.findMany({
    where: {
      ...(filters?.rating ? { rating: filters.rating } : {}),
      ...(filters?.hidden !== undefined ? { is_hidden: filters.hidden } : {}),
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      is_verified_purchase: true,
      is_hidden: true,
      seller_reply: true,
      created_at: true,
      user: { select: { name: true, email: true } },
      product: { select: { name: true, id: true } },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function hideReview(reviewId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) return { success: false, error: 'Avis non trouvé.' }

    await prisma.review.update({
      where: { id: reviewId },
      data: { is_hidden: true },
    })

    await logAdminAction({
      adminId,
      action: 'hide_review',
      resourceType: 'Review',
      resourceId: reviewId,
      metadata: { product_id: review.product_id },
    })

    revalidatePath('/admin/reviews')
    return { success: true, message: 'Avis masqué.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function unhideReview(reviewId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) return { success: false, error: 'Avis non trouvé.' }

    await prisma.review.update({
      where: { id: reviewId },
      data: { is_hidden: false },
    })

    await logAdminAction({
      adminId,
      action: 'unhide_review',
      resourceType: 'Review',
      resourceId: reviewId,
      metadata: { product_id: review.product_id },
    })

    revalidatePath('/admin/reviews')
    return { success: true, message: 'Avis republié.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) return { success: false, error: 'Avis non trouvé.' }

    await prisma.review.delete({ where: { id: reviewId } })

    await logAdminAction({
      adminId,
      action: 'delete_review',
      resourceType: 'Review',
      resourceId: reviewId,
      metadata: { product_id: review.product_id, rating: review.rating },
    })

    revalidatePath('/admin/reviews')
    return { success: true, message: 'Avis supprimé.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
