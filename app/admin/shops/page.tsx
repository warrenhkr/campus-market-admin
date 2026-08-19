import { getAllShops } from '@/actions/shops'
import { ShopsTable } from '@/components/admin/ShopsTable'

export const metadata = { title: 'Shops - Admin' }

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; suspended?: string }>
}) {
  const filters = await searchParams
  const shops = await getAllShops(filters)
  const suspendedCount = shops.filter((shop) => shop.isSuspended).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Boutiques</h1>
          <p className="text-gray-600">{shops.length} boutiques, {suspendedCount} suspendues.</p>
        </div>
        <form className="flex gap-2">
          <input
            name="search"
            defaultValue={filters.search ?? ''}
            placeholder="Rechercher une boutique"
            className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <select name="suspended" defaultValue={filters.suspended ?? ''} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">Tous les statuts</option>
            <option value="false">Actives</option>
            <option value="true">Suspendues</option>
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Filtrer</button>
        </form>
      </div>

      <ShopsTable shops={shops} />
    </div>
  )
}
