import { createServerClient } from '@supabase/ssr'
import { PrismaClient } from '@prisma/client'

const ADMIN_EMAIL = 'admin@campusmarket.bj'
const ADMIN_PASSWORD = 'Admin123456'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔄 Création du compte admin...')
    
    // Créer le service client Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: { getAll: () => [], setAll: () => {} },
        auth: { persistSession: false },
      }
    )

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })

    if (authError) {
      console.error('❌ Erreur Supabase Auth:', authError.message)
      return
    }

    const userId = authData.user.id
    console.log(`✅ Utilisateur créé dans Supabase: ${userId}`)

    // 2. Créer l'enregistrement dans Prisma avec rôle ADMIN
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { role: 'ADMIN' },
      create: {
        id: userId,
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'ADMIN',
      },
    })

    console.log(`✅ Compte admin créé avec succès!`)
    console.log(`\n📧 Email: ${ADMIN_EMAIL}`)
    console.log(`🔑 Mot de passe: ${ADMIN_PASSWORD}`)
    console.log(`\n⚠️ Change le mot de passe après la première connexion`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
