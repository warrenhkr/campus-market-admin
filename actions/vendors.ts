'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getResendClient, EMAIL_FROM, EMAIL_REPLY_TO } from '@/lib/email/resend'
import { VendorApprovedEmail } from '@/lib/email/templates/vendor-approved'
import { VendorRejectedEmail } from '@/lib/email/templates/vendor-rejected'

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string }

async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Non authentifié.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Accès refusé.')
  return user.id
}

export async function getPendingVendors() {
  await assertAdmin()
  return prisma.seller.findMany({
    where: { verification_status: 'PENDING' },
    include: {
      user: { select: { id: true, email: true, name: true, created_at: true } },
    },
    orderBy: { created_at: 'asc' },
  })
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

export async function approveVendor(sellerId: string): Promise<ActionResult> {
  return { success: false, error: 'La validation manuelle des comptes vendeurs est désactivée.' }
  /*
  try {
    await assertAdmin()

    const seller = await prisma.$transaction(async (tx) => {
      const s = await tx.seller.update({
        where: { id: sellerId },
        data: { verification_status: 'APPROVED' },
        include: { user: { select: { email: true, name: true, role: true } } },
      })
      if (s.user.role !== 'ADMIN') {
        await tx.user.update({
          where: { id: s.user_id },
          data: { role: 'SELLER' },
        })
      }
      return s
    })

    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: EMAIL_FROM,
        replyTo: EMAIL_REPLY_TO,
        to: seller.user.email,
        subject: `🎉 Votre boutique "${seller.shop_name}" est approuvée !`,
        react: VendorApprovedEmail({
          shopName: seller.shop_name,
          sellerName: seller.user.name ?? undefined,
        }),
      })
    } catch (emailErr) {
      console.error('Email non envoyé (approbation):', emailErr)
    }

    revalidatePath('/admin/vendors')
    return { success: true, message: 'Vendeur approuvé avec succès.' }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
  */
}

export async function rejectVendor(sellerId: string, reason: string): Promise<ActionResult> {
  return { success: false, error: 'La validation manuelle des comptes vendeurs est désactivée.' }
  /*
  try {
    await assertAdmin()
    if (!reason.trim()) return { success: false, error: 'Le motif est obligatoire.' }

    const seller = await prisma.$transaction(async (tx) => {
      const s = await tx.seller.update({
        where: { id: sellerId },
        data: { verification_status: 'REJECTED' },
        include: { user: { select: { email: true, name: true } } },
      })
      return s
    })

    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: EMAIL_FROM,
        replyTo: EMAIL_REPLY_TO,
        to: seller.user.email,
        subject: `Refus de votre boutique "${seller.shop_name}"`,
        react: VendorRejectedEmail({
          shopName: seller.shop_name,
          sellerName: seller.user.name ?? undefined,
          reason,
        }),
      })
    } catch (emailErr) {
      console.error('Email non envoyé (rejet):', emailErr)
    }

    revalidatePath('/admin/vendors')
    return { success: true, message: 'Vendeur rejeté avec succès.' }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
  */
}