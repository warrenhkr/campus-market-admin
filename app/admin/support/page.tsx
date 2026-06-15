import { getAllTickets } from '@/actions/support'
import { SupportTicketsTable } from '@/components/admin/SupportTicketsTable'

export const metadata = { title: 'Support - Admin' }

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>
}) {
  const filters = await searchParams
  const tickets = await getAllTickets(filters)
  const openCount = tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Support</h1>
          <p className="text-gray-600">{openCount} tickets ouverts sur {tickets.length}.</p>
        </div>
        <form className="flex gap-2">
          <select name="status" defaultValue={filters.status ?? ''} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">Tous les statuts</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <select name="category" defaultValue={filters.category ?? ''} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">Toutes categories</option>
            <option value="TECHNICAL">TECHNICAL</option>
            <option value="BILLING">BILLING</option>
            <option value="ACCOUNT">ACCOUNT</option>
            <option value="DISPUTE">DISPUTE</option>
            <option value="OTHER">OTHER</option>
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Filtrer</button>
        </form>
      </div>

      <SupportTicketsTable tickets={tickets} />
    </div>
  )
}
