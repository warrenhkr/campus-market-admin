'use client'

import { useState, useTransition } from 'react'
import { updateSetting } from '@/actions/settings'

type Setting = {
  id: string
  key: string
  value: string
  description: string | null
  category: string
}

export function SettingsManager({ settings }: { settings: Setting[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))
  )
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function save(key: string) {
    startTransition(async () => {
      const result = await updateSetting(key, values[key] ?? '')
      setMessage(result.success ? result.message : result.error)
      setTimeout(() => setMessage(null), 3000)
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Parametres marketplace</h2>
        {message && <span className="text-xs text-emerald-700">{message}</span>}
      </div>
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="grid grid-cols-[1fr_180px_auto] gap-3 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{setting.key}</p>
              <p className="text-xs text-gray-500">{setting.description ?? setting.category}</p>
            </div>
            <input
              value={values[setting.key] ?? ''}
              onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              onClick={() => save(setting.key)}
              disabled={isPending}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Sauver
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
