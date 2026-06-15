import { getAllProducts } from '@/actions/catalog'
import { ProductsModerationTable } from '@/components/admin/ProductsModerationTable'

export default async function ProductsPage() {
  const products = await getAllProducts()

  const pending = products.filter((p) => p.status === 'PENDING_REVIEW').length
  const approved = products.filter((p) => p.status === 'APPROVED').length
  const rejected = products.filter((p) => p.status === 'REJECTED').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Modération des produits</h1>
        <p className="text-gray-600">{products.length} produits au total</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-600 mb-1">En attente</p>
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-600 mb-1">Approuvés</p>
          <p className="text-2xl font-bold text-emerald-600">{approved}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-600 mb-1">Rejetés</p>
          <p className="text-2xl font-bold text-red-600">{rejected}</p>
        </div>
      </div>

      <ProductsModerationTable products={products} />
    </div>
  )
}
