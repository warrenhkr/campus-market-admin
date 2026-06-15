'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  password: z.string().min(8, 'Minimum 8 caractères.'),
})

export type LoginResult =
  | { success: true }
  | { success: false; errors: Record<string, string> }

export async function loginAdmin(formData: FormData): Promise<LoginResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const errors: Record<string, string> = {}
    parsed.error.issues.forEach((e) => {
      if (e.path[0]) errors[e.path[0] as string] = e.message
    })
    return { success: false, errors }
  }

  const { email, password } = parsed.data
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { success: false, errors: { email: 'Email ou mot de passe incorrect.' } }
  }

  const profile = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { role: true },
  })

  if (profile?.role !== 'ADMIN') {
    await supabase.auth.signOut()
    return {
      success: false,
      errors: { email: 'Accès refusé. Ce compte n\'a pas les droits administrateur.' },
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
    where: { id: user.id },
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
    where: { id: user.id },
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

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis.'),
  newPassword: z.string()
    .min(8, 'Minimum 8 caractères.')
    .regex(/[A-Z]/, 'Au moins une majuscule.')
    .regex(/[0-9]/, 'Au moins un chiffre.'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas.',
  path: ['confirmPassword'],
})

export type PasswordResult =
  | { success: true; message: string }
  | { success: false; errors: Record<string, string> }

export async function changeAdminPassword(formData: FormData): Promise<PasswordResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, errors: { form: 'Non authentifié.' } }

  const parsed = PasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const errors: Record<string, string> = {}
    parsed.error.issues.forEach((e) => {
      if (e.path[0]) errors[e.path[0] as string] = e.message
    })
    return { success: false, errors }
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: parsed.data.currentPassword,
  })

  if (verifyError) {
    return { success: false, errors: { currentPassword: 'Mot de passe actuel incorrect.' } }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (updateError) {
    return { success: false, errors: { form: updateError.message } }
  }

  return { success: true, message: 'Mot de passe mis à jour avec succès.' }
}
