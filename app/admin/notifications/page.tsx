import { getNotifications } from '@/actions/notifications'
import { NotificationCenter } from '@/components/admin/NotificationCenter'

export const metadata = { title: 'Notifications — Admin' }

export default async function NotificationsPage() {
  const notifications = await getNotifications()
  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          {unread > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100
              text-red-700 rounded-full">
              {unread} non lue{unread > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Alertes automatiques et événements de la plateforme.
        </p>
      </div>
      <NotificationCenter initialNotifications={notifications} />
    </div>
  )
}