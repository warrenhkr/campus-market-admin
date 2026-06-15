// components/auth/LogoutButton.tsx
'use client'

import { useTransition } from 'react'
import { logoutAdmin } from '@/actions/auth'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAdmin()
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500
        hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
        disabled:opacity-50">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {isPending ? 'Déconnexion...' : 'Se déconnecter'}
    </button>
  )
}