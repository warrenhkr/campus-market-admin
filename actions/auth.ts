'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getResendClient, EMAIL_FROM, EMAIL_REPLY_TO } from '@/lib/email/resend'
import { AdminOtpEmail, getAdminOtpHtml } from '@/lib/email/templates/admin-otp'
import { z } from 'zod'

const RequestOTPSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
})

const VerifyOTPSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  code: z.string().min(6, 'Le code doit comporter au moins 6 caractères.'),
})

export type OTPRequestResult =
  | { success: true; message: string }
  | { success: false; errors: Record<string, string> }

export type OTPVerifyResult =
  | { success: true }
  | { success: false; errors: Record<string, string> }

// Constantes pour le rate limiting
const MAX_REQUESTS_PER_15_MIN = 3
const MAX_FAILED_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function requestAdminOTP(email: string): Promise<OTPRequestResult> {
  const parsed = RequestOTPSchema.safeParse({ email })
  if (!parsed.success) {
    return { success: false, errors: { email: 'Adresse email invalide.' } }
  }

  const cleanEmail = parsed.data.email.trim().toLowerCase()
  const now = new Date()

  // 5. NETTOYAGE AUTOMATIQUE : Purger tous les codes OTP expirés de la BD
  try {
    await prisma.adminOtp.deleteMany({
      where: { expires_at: { lt: now } },
    })
  } catch (err) {
    console.error('Erreur lors de la purge automatique des OTP expirés:', err)
  }

  // 4. VÉRIFIER LES ADMINS EN BASE : Vérifier si l'utilisateur existe et possède le rôle ADMIN
  const dbUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true, role: true },
  })

  if (!dbUser || dbUser.role !== 'ADMIN') {
    return {
      success: false,
      errors: { email: "Aucun compte administrateur associé à cette adresse email." },
    }
  }

  // 2. RATE LIMITING - Demande de code OTP (Max 3 par 15 minutes)
  // Utilisation d'un upsert atomique pour éviter les doubles incréments
  // (StrictMode dev ou soumissions concurrentes)
  let rateLimit = await prisma.adminOtpRateLimit.findUnique({
    where: { email: cleanEmail },
  })

  if (rateLimit) {
    // Vérifier si le compte est bloqué suite à trop d'échecs de saisie
    if (rateLimit.blocked_until && rateLimit.blocked_until > now) {
      const remainingMinutes = Math.ceil((rateLimit.blocked_until.getTime() - now.getTime()) / 60000)
      return {
        success: false,
        errors: { email: `Accès temporairement bloqué suite à trop d'échecs. Réessayez dans ${remainingMinutes} minute(s).` },
      }
    }

    const windowExpired = now.getTime() - rateLimit.first_request_at.getTime() > RATE_LIMIT_WINDOW_MS
    if (windowExpired) {
      // Réinitialiser la fenêtre de 15 minutes
      rateLimit = await prisma.adminOtpRateLimit.update({
        where: { email: cleanEmail },
        data: {
          request_count: 1,
          first_request_at: now,
        },
      })
    } else {
      if (rateLimit.request_count >= MAX_REQUESTS_PER_15_MIN) {
        const resetMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - (now.getTime() - rateLimit.first_request_at.getTime())) / 60000)
        return {
          success: false,
          errors: { email: `Limite atteinte (3 demandes max par 15 min). Veuillez patienter ${resetMinutes} minute(s).` },
        }
      }

      // Incrément conditionnel atomique : n'incrémente que si request_count
      // est encore le même qu'au moment de la lecture (protection concurrence)
      const updated = await prisma.adminOtpRateLimit.updateMany({
        where: {
          email: cleanEmail,
          request_count: rateLimit.request_count, // guard optimiste
        },
        data: { request_count: { increment: 1 } },
      })

      // Si 0 lignes mises à jour → un autre appel concurrent a déjà incrémenté
      // On relit et on vérifie la limite
      if (updated.count === 0) {
        const fresh = await prisma.adminOtpRateLimit.findUnique({
          where: { email: cleanEmail },
        })
        if (fresh && fresh.request_count >= MAX_REQUESTS_PER_15_MIN) {
          const resetMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - (now.getTime() - fresh.first_request_at.getTime())) / 60000)
          return {
            success: false,
            errors: { email: `Limite atteinte (3 demandes max par 15 min). Veuillez patienter ${resetMinutes} minute(s).` },
          }
        }
        // Sinon, l'autre appel (StrictMode) a déjà incrémenté → on continue sans re-incrémenter
        rateLimit = fresh ?? rateLimit
      } else {
        rateLimit = await prisma.adminOtpRateLimit.findUnique({ where: { email: cleanEmail } }) ?? rateLimit
      }
    }
  } else {
    rateLimit = await prisma.adminOtpRateLimit.create({
      data: {
        email: cleanEmail,
        request_count: 1,
        first_request_at: now,
      },
    })
  }

  // 3. GÉRER L'INVALIDATION DES ANCIENS CODES : Supprimer tout ancien OTP pour cet email
  await prisma.adminOtp.deleteMany({
    where: { email: cleanEmail },
  })

  // Génération du nouveau code OTP à 6 chiffres
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000) // Valide 10 minutes

  // 1. SÉCURISER LE FALLBACK CONSOLE : check strict sur NODE_ENV
  const isProduction = process.env.NODE_ENV === 'production'
  if (!isProduction) {
    console.log('\n========================================')
    console.log('🔑 CODE OTP GÉNÉRÉ POUR ADMIN:', cleanEmail)
    console.log('👉 CODE A 6 CHIFFRES :', code)
    console.log('========================================\n')
  }

  // Sauvegarde dans la table PostgreSQL AdminOtp
  await prisma.adminOtp.create({
    data: {
      email: cleanEmail,
      code,
      expires_at: expiresAt,
    },
  })

  // Envoi de l'email via Resend
  let resendSent = false
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: EMAIL_FROM,
        replyTo: EMAIL_REPLY_TO,
        to: cleanEmail,
        subject: `🔑 Code d'accès administrateur : ${code}`,
        html: getAdminOtpHtml(code, cleanEmail),
      })
      resendSent = true
    } catch (emailErr: any) {
      console.error('Erreur d\'envoi d\'email via Resend:', emailErr)

      // En production, ne JAMAIS logger ni renvoyer le code en clair, mais une erreur explicite
      if (isProduction) {
        return {
          success: false,
          errors: { email: "Impossible d'envoyer l'email d'accès administrateur. Veuillez contacter le support." },
        }
      }
    }
  }

  return {
    success: true,
    message: resendSent
      ? `Le code d'accès à 6 chiffres a été envoyé par email à ${cleanEmail}.`
      : `Code généré avec succès pour ${cleanEmail} ! (Mode dev : voir console du terminal).`,
  }
}

export async function verifyAdminOTP(email: string, code: string): Promise<OTPVerifyResult> {
  const parsed = VerifyOTPSchema.safeParse({ email, code })
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    parsed.error.issues.forEach((e) => {
      if (e.path[0]) errors[e.path[0] as string] = e.message
    })
    return { success: false, errors }
  }

  const cleanEmail = parsed.data.email.trim().toLowerCase()
  const cleanCode = parsed.data.code.trim()
  const now = new Date()

  // 2. RATE LIMITING - Vérification du blocage suite à des échecs de saisie
  const rateLimit = await prisma.adminOtpRateLimit.findUnique({
    where: { email: cleanEmail },
  })

  if (rateLimit?.blocked_until && rateLimit.blocked_until > now) {
    const remainingMinutes = Math.ceil((rateLimit.blocked_until.getTime() - now.getTime()) / 60000)
    return {
      success: false,
      errors: { code: `Compte temporairement bloqué suite à 5 échecs consécutifs. Réessayez dans ${remainingMinutes} minute(s).` },
    }
  }

  // 1. Recherche du code dans AdminOtp
  const validOtp = await prisma.adminOtp.findFirst({
    where: {
      email: cleanEmail,
      code: cleanCode,
      expires_at: { gt: now },
    },
  })

  if (!validOtp) {
    // Incrémenter le compteur d'échecs
    const currentFailed = (rateLimit?.failed_attempts || 0) + 1

    if (currentFailed >= MAX_FAILED_ATTEMPTS) {
      const blockedUntil = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
      await prisma.adminOtpRateLimit.upsert({
        where: { email: cleanEmail },
        update: {
          failed_attempts: currentFailed,
          blocked_until: blockedUntil,
        },
        create: {
          email: cleanEmail,
          failed_attempts: currentFailed,
          blocked_until: blockedUntil,
        },
      })

      return {
        success: false,
        errors: { code: "5 échecs consécutifs. Votre accès administrateur est temporairement bloqué pendant 15 minutes." },
      }
    } else {
      await prisma.adminOtpRateLimit.upsert({
        where: { email: cleanEmail },
        update: { failed_attempts: currentFailed },
        create: { email: cleanEmail, failed_attempts: currentFailed },
      })

      const remaining = MAX_FAILED_ATTEMPTS - currentFailed
      return {
        success: false,
        errors: { code: `Code d'accès invalide ou expiré. ${remaining} essai(s) restant(s) avant blocage temporaire.` },
      }
    }
  }

  // Code valide : réinitialiser le rate limit & supprimer les OTPs de cet email
  await prisma.$transaction([
    prisma.adminOtp.deleteMany({ where: { email: cleanEmail } }),
    prisma.adminOtpRateLimit.upsert({
      where: { email: cleanEmail },
      update: { failed_attempts: 0, blocked_until: null },
      create: { email: cleanEmail, failed_attempts: 0 },
    }),
  ])

  // 4. Vérification du rôle ADMIN
  const profile = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true, role: true },
  })

  if (!profile || profile.role !== 'ADMIN') {
    return {
      success: false,
      errors: { code: "Accès refusé. Ce compte ne possède pas les privilèges administrateur." },
    }
  }

  // Créer une vraie session Supabase via service role :
  // 1. generateLink → obtient un hashed_token sans envoyer d'email
  // 2. exchangeCodeForSession → crée les cookies de session côté serveur
  const serviceClient = createSupabaseServiceClient()
  const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
    type: 'magiclink',
    email: cleanEmail,
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('Erreur generateLink:', linkError)
    return {
      success: false,
      errors: { code: "Impossible de créer la session administrateur. Veuillez réessayer." },
    }
  }

  // Échanger le token contre une vraie session (crée les cookies sb-*)
  const anonClient = await createSupabaseServerClient()
  const { error: sessionError } = await anonClient.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })

  if (sessionError) {
    console.error('Erreur verifyOtp/session:', sessionError)
    return {
      success: false,
      errors: { code: "Erreur lors de l'établissement de la session. Veuillez réessayer." },
    }
  }

  redirect('/admin')
}

export async function logoutAdmin(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getAdminSession() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      email: true,
      name: true,
      avatar_url: true,
      role: true,
      created_at: true,
    },
  })

  if (profile?.role !== 'ADMIN') return null
  return { user, profile }
}

export async function getAdminSessionWithUnreadCount() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { session: null, unreadCount: 0 }

  const profile = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      email: true,
      name: true,
      avatar_url: true,
      role: true,
      created_at: true,
    },
  })

  if (profile?.role !== 'ADMIN') return { session: null, unreadCount: 0 }

  const unreadCount = await prisma.notification.count({ where: { is_read: false } })

  return {
    session: { user, profile },
    unreadCount,
  }
}