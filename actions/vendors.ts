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

export async function approveVendor(sellerId: string): Promise<ActionResult> {
  try {
    await assertAdmin()

    const seller = await prisma.$transaction(async (tx) => {
      const s = await tx.seller.update({
        where: { id: sellerId },
        data: { verification_status: 'APPROVED' },
        include: { user: { select: { email: true, name: true } } },
      })
      await tx.user.update({
        where: { id: s.user_id },
        data: { role: 'SELLER' },
      })
      return s
    })

    // Envoi email
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
      // On ne bloque pas si l'email échoue
    }

    revalidatePath('/admin/vendors')
    return { success: true, message: 'Vendeur approuvé avec succès.' }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}

export async function rejectVendor(sellerId: string, reason: string): Promise<ActionResult> {
  try {
    await assertAdmin()
    if (!reason.trim()) return { success: false, error: 'Le motif est obligatoire.' }

   const seller = await tx.seller.update({
  where: { id: sellerId },
  data: { verification_status: 'APPROVED' },
  include: { user: { select: { email: true, name: true, role: true } } },
})

// Ne jamais écraser le roleADMIN d'un 
if (seller.user.role !== 'ADMIN') {
  await tx.user.update({
    where: { id: seller.user_id },
    data: { role: 'SELLER' },
  })
}

    // Envoi email
    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: EMAIL_FROM,
        replyTo: EMAIL_REPLY_TO,
        to: seller.user.email,
        subject: `Votre demande pour "${seller.shop_name}" n'a pas été approuvée`,
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
    return { success: true, message: 'Vendeur rejeté.' }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur inconnue.' }
  }
}