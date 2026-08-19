import { getSystemAlerts } from '@/actions/alerts'
import { SystemAlertsTable } from '@/components/admin/SystemAlertsTable'

export const metadata = { title: 'Alertes - Admin' }

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ unread?: string; severity?: string }>
}) {
  const filters = await searchParams
  const alerts = await getSystemAlerts({
    unread: filters.unread === 'true',
    severity: filters.severity,
  })
  const unreadCount = alerts.filter((alert) => !alert.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Alertes systeme</h1>
          <p className="text-gray-600">{unreadCount} alertes non lues sur {alerts.length}.</p>
        </div>
        <form className="flex gap-2">
          <select name="severity" defaultValue={filters.severity ?? ''} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">Toutes severites</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <select name="unread" defaultValue={filters.unread ?? ''} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">Toutes</option>
            <option value="true">Non lues</option>
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Filtrer</button>
        </form>
      </div>

      <SystemAlertsTable alerts={alerts} />
    </div>
  )
}
