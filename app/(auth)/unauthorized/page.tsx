import { getAdminSession } from '@/actions/auth'
import { LogoutButton } from '@/components/auth/LogoutButton'

export const metadata = { title: '403 — Accès refusé' }

export default async function UnauthorizedPage() {
  const session = await getAdminSession()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16
          bg-red-100 rounded-2xl mb-5">
          <span className="text-3xl">⊘</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Votre compte ne dispose pas des droits administrateur requis.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <a href="/"
            className="w-full py-2.5 text-sm font-medium bg-emerald-600
              text-white rounded-xl hover:bg-emerald-700 transition-colors
              text-center">
            Retour à l'accueil
          </a>
          {session && (
            <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
              Connecté en tant que <strong>{session.profile.email}</strong>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}