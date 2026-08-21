import { getAllVendors } from '@/actions/vendors'

export const metadata = { title: 'Vendeurs — Admin' }

export default async function VendorsPage() {
  const vendors = await getAllVendors()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Vendeurs
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Les boutiques sont actives dès leur création. La modération concerne les contenus et les signalements.
        </p>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucun vendeur.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Vendeur</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Boutique</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Création</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{vendor.user.name ?? 'Sans nom'}</p>
                    <p className="text-xs text-gray-500">{vendor.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {vendor.shops[0]?.name ?? vendor.shop_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {vendor.created_at.toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}