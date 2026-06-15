import { getPendingVendors } from '@/actions/vendors'
import { VendorTable } from '@/components/admin/VendorTable'

export const metadata = { title: 'Validation Vendeurs — Admin' }

export default async function VendorsPage() {
  const vendors = await getPendingVendors()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Validation des vendeurs
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {vendors.length} demande{vendors.length > 1 ? 's' : ''} en attente
          d'approbation.
        </p>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucune demande en attente. ✓
        </div>
      ) : (
        <VendorTable vendors={vendors} />
      )}
    </div>
  )
}