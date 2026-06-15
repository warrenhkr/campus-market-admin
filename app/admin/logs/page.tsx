import { getAdminLogs } from '@/actions/audit'
import { AdminLogsTable } from '@/components/admin/AdminLogsTable'

export const metadata = { title: 'Logs - Admin' }

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; action?: string; resourceType?: string }>
}) {
  const filters = await searchParams
  const logs = await getAdminLogs(filters)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin logs</h1>
          <p className="text-gray-600">Historique des {logs.length} dernieres actions admin.</p>
        </div>
        <form className="flex gap-2">
          <input
            name="search"
            defaultValue={filters.search ?? ''}
            placeholder="Admin, action, cible"
            className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Filtrer</button>
        </form>
      </div>

      <AdminLogsTable logs={logs} />
    </div>
  )
}
