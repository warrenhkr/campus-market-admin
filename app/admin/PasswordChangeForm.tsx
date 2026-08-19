'use client'

import { KeyRound } from 'lucide-react'

export function PasswordChangeForm() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <KeyRound className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900">
          Authentification Sans Mot de Passe (Passwordless)
        </h2>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Le panel d&apos;administration utilise désormais la connexion sécurisée par **code d&apos;accès OTP à 6 chiffres** envoyé directement sur votre adresse email. Vous n&apos;avez plus besoin de retenir ni de modifier un mot de passe.
      </p>
    </div>
  )
}