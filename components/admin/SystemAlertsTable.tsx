'use client'

import { useState, useTransition } from 'react'
import { dismissSystemAlert, markSystemAlertAsRead } from '@/actions/alerts'

type Alert = {
  id: string
  alert_type: string
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  message: string
  metadata: unknown
  is_read: boolean
  dismissed_at: Date | null
  created_at: Date
}

export function SystemAlertsTable({ alerts: initialAlerts }: { alerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [isPending, startTransition] = useTransition()

  function markRead(alert: Alert) {
    startTransition(async () => {
      const result = await markSystemAlertAsRead(alert.id)
      if (result.success) {
        setAlerts((current) =>
          current.map((item) => (item.id === alert.id ? { ...item, is_read: true } : item))
        )
      }
    })
  }

  function dismiss(alert: Alert) {
    startTransition(async () => {
      const result = await dismissSystemAlert(alert.id)
      if (result.success) {
        setAlerts((current) => current.filter((item) => item.id !== alert.id))
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Alerte</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Severite</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Date</th>
            <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{alert.alert_type}</p>
                <p className="text-xs text-gray-500">{alert.message}</p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                  {alert.severity}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{alert.is_read ? 'Lue' : 'Non lue'}</td>
              <td className="px-6 py-4 text-xs text-gray-500">{new Date(alert.created_at).toLocaleString('fr-FR')}</td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button onClick={() => markRead(alert)} disabled={isPending || alert.is_read} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    Lire
                  </button>
                  <button onClick={() => dismiss(alert)} disabled={isPending} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                    Masquer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
