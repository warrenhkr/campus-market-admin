// components/auth/LoginForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { loginAdmin } from '@/actions/auth'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const formData = new FormData(e.currentTarget)
    if (redirectTo) formData.set('redirect', redirectTo)

    startTransition(async () => {
      const result = await loginAdmin(formData)
      if (!result.success) {
        setErrors(result.errors)
      }
      // En cas de succès, loginAdmin appelle redirect() côté serveur
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="admin@campusmarket.bj"
            className={`w-full border rounded-xl px-3.5 py-2.5 text-sm
              text-gray-900 placeholder-gray-300 transition-colors
              focus:outline-none focus:ring-2 focus:ring-emerald-200
              focus:border-emerald-400
              ${errors.email
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white'}`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1.5">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm
                text-gray-900 placeholder-gray-300 pr-10 transition-colors
                focus:outline-none focus:ring-2 focus:ring-emerald-200
                focus:border-emerald-400
                ${errors.password
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 hover:text-gray-600 transition-colors text-xs">
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Erreur globale */}
        {errors.form && (
          <div className="bg-red-50 border border-red-200 rounded-xl
            px-3.5 py-2.5 text-xs text-red-700">
            {errors.form}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 text-sm font-medium bg-emerald-600 text-white
          rounded-xl hover:bg-emerald-700 active:bg-emerald-800
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Connexion...
          </span>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  )
}