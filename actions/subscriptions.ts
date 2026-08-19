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

export async function getAllSellersWithSubscription() {
  await assertAdmin()
  return prisma.seller.findMany({
    where: { verification_status: 'APPROVED' },
    select: {
      id: true,
      shop_name: true,
      subscription_plan: true,
      subscription_expires_at: true,
      user: { select: { name: true, email: true, avatar_url: true } },
      shops: { select: { id: true, name: true, slug: true }, take: 1 },
    },
    orderBy: { subscription_expires_at: 'asc' },
  })
}

export async function getProPlanRequests() {
  await assertAdmin()
  return prisma.supportTicket.findMany({
    where: {
      subject: { contains: 'Demande plan Pro', mode: 'insensitive' },
      category: 'ACCOUNT',
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          seller: { select: { id: true, shop_name: true, subscription_plan: true } },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function assignProPlan(
  sellerId: string,
  expiresInDays: number
): Promise<ActionResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié.')
    const { data } = await supabase.rpc('is_admin')
    if (!data) throw new Error('Accès refusé.')

    if (!sellerId) return { success: false, error: 'Vendeur requis.' }
    if (!expiresInDays || expiresInDays < 1 || expiresInDays > 365) {
      return { success: false, error: 'Durée invalide (1–365 jours).' }
    }

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { id: true, user_id: true, shop_name: true },
    })
    if (!seller) return { success: false, error: 'Vendeur introuvable.' }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    await prisma.$transaction([
      prisma.seller.update({
        where: { id: sellerId },
        data: {
          subscription_plan: 'PRO',
          subscription_expires_at: expiresAt,
        },
      }),
      prisma.adminLog.create({
        data: {
          user_id: user.id,
          action: 'subscription_pro_assigned',
          resource_type: 'seller',
          resource_id: sellerId,
          changes: { expires_at: expiresAt.toISOString(), expires_in_days: expiresInDays },
        },
      }),
      prisma.notification.create({
        data: {
          user_id: seller.user_id,
          type: 'subscription',
          title: '🎉 Plan Pro activé',
          message: `Votre plan Pro a été activé par l'équipe Campus Market. Il est valable jusqu'au ${expiresAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
        },
      }),
    ])

    revalidatePath('/admin/subscriptions')
    return { success: true, message: `Plan Pro assigné à "${seller.shop_name}" pour ${expiresInDays} jours.` }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function extendSubscription(sellerId: string, months: number): Promise<ActionResult> {
  try {
    await assertAdmin()
    if (![1, 3, 6, 12].includes(months)) return { success: false, error: 'Durée invalide.' }

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { subscription_expires_at: true, shop_name: true },
    })
    if (!seller) return { success: false, error: 'Vendeur introuvable.' }

    const baseDate =
      seller.subscription_expires_at && seller.subscription_expires_at > new Date()
        ? seller.subscription_expires_at
        : new Date()

    const newExpiry = new Date(baseDate)
    newExpiry.setMonth(newExpiry.getMonth() + months)

    await prisma.seller.update({
      where: { id: sellerId },
      data: { subscription_expires_at: newExpiry },
    })

    revalidatePath('/admin/subscriptions')
    return { success: true, message: `Abonnement prolongé de ${months} mois.` }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function toggleShopSuspension(shopId: string, suspend: boolean): Promise<ActionResult> {
  try {
    await assertAdmin()
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { name: true },
    })
    if (!shop) return { success: false, error: 'Boutique introuvable.' }

    await prisma.product.updateMany({
      where: { shop_id: shopId },
      data: { is_available: !suspend },
    })

    revalidatePath('/admin/subscriptions')
    return {
      success: true,
      message: suspend ? `Boutique "${shop.name}" suspendue.` : `Boutique "${shop.name}" réactivée.`,
    }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function getSubscriptionKPIs() {
  await assertAdmin()
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [total, active, expired, expiringSoon] = await Promise.all([
    prisma.seller.count({ where: { verification_status: 'APPROVED' } }),
    prisma.seller.count({
      where: { verification_status: 'APPROVED', subscription_expires_at: { gt: in7Days } },
    }),
    prisma.seller.count({
      where: {
        verification_status: 'APPROVED',
        OR: [{ subscription_expires_at: { lt: now } }, { subscription_expires_at: null }],
      },
    }),
    prisma.seller.count({
      where: { verification_status: 'APPROVED', subscription_expires_at: { gte: now, lte: in7Days } },
    }),
  ])

  return { total, active, expired, expiringSoon }
}