'use client'

import { useState, useTransition } from 'react'
import { deleteNotification, markAllAsRead, markAsRead } from '@/actions/notifications'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: Date
}

export function NotificationCenter({
  initialNotifications,
}: {
  initialNotifications: Notification[]
}) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()

  function readOne(id: string) {
    startTransition(async () => {
      const result = await markAsRead(id)
      if (result.success) {
        setNotifications((current) =>
          current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
        )
      }
    })
  }

  function readAll() {
    startTransition(async () => {
      const result = await markAllAsRead()
      if (result.success) {
        setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
      }
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteNotification(id)
      if (result.success) {
        setNotifications((current) => current.filter((item) => item.id !== id))
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
        <p className="text-sm font-semibold text-gray-900">{notifications.length} notifications</p>
        <button onClick={readAll} disabled={isPending} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50">
          Tout marquer lu
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {notifications.map((notification) => (
          <div key={notification.id} className={`px-5 py-4 flex gap-4 justify-between ${notification.is_read ? 'bg-white' : 'bg-emerald-50/40'}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">{notification.type}</span>
                {!notification.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              <p className="mt-1 text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
              <p className="mt-2 text-xs text-gray-400">{new Date(notification.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <div className="flex items-start gap-2">
              <button onClick={() => readOne(notification.id)} disabled={isPending || notification.is_read} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Lire
              </button>
              <button onClick={() => remove(notification.id)} disabled={isPending} className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
