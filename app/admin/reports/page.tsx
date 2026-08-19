import { getAllReports } from '@/actions/reports'
import { ReportsTable } from '@/components/admin/ReportsTable'

export const metadata = { title: 'Reports - Admin' }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const filters = await searchParams
  const reports = await getAllReports(filters)
  const pendingCount = reports.filter((report) => report.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Signalements</h1>
          <p className="text-gray-600">{pendingCount} signalements en attente sur {reports.length}.</p>
        </div>
        <form className="flex gap-2">
          <input
            name="search"
            defaultValue={filters.search ?? ''}
            placeholder="Motif ou description"
            className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <select name="status" defaultValue={filters.status ?? ''} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">Tous</option>
            <option value="PENDING">PENDING</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="DISMISSED">DISMISSED</option>
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Filtrer</button>
        </form>
      </div>

      <ReportsTable reports={reports} />
    </div>
  )
}
