// components/admin/PasswordChangeForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { changeAdminPassword } from '@/actions/auth'

export function PasswordChangeForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setSuccess('')

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await changeAdminPassword(formData)
      if (result.success) {
        setSuccess(result.message)
        ;(e.target as HTMLFormElement).reset()
      } else {
        setErrors(result.errors)
      }
    })
  }

  const fields = [
    {
      id: 'currentPassword',
      label: 'Mot de passe actuel',
      autoComplete: 'current-password',
    },
    {
      id: 'newPassword',
      label: 'Nouveau mot de passe',
      autoComplete: 'new-password',
      hint: 'Min. 8 caractères, 1 majuscule, 1 chiffre.',
    },
    {
      id: 'confirmPassword',
      label: 'Confirmer le nouveau mot de passe',
      autoComplete: 'new-password',
    },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Changer le mot de passe
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-xs font-medium text-gray-700 mb-1.5">
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.id}
              type="password"
              autoComplete={field.autoComplete}
              className={`w-full border rounded-xl px-3.5 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-200
                focus:border-emerald-400 transition-colors
                ${errors[field.id]
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'}`}
            />
            {field.hint && !errors[field.id] && (
              <p className="mt-1 text-xs text-gray-400">{field.hint}</p>
            )}
            {errors[field.id] && (
              <p className="mt-1 text-xs text-red-600">{errors[field.id]}</p>
            )}
          </div>
        ))}

        {errors.form && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3.5
            py-2.5 text-xs text-red-700">
            {errors.form}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl
            px-3.5 py-2.5 text-xs text-emerald-700 font-medium">
            ✓ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 text-sm font-medium bg-gray-900 text-white
            rounded-xl hover:bg-gray-700 disabled:opacity-50
            disabled:cursor-not-allowed transition-colors mt-2">
          {isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  )
}