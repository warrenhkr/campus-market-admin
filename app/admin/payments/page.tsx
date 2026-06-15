import { getAllPayments, getPaymentStats } from '@/actions/payments'
import { PaymentsTable } from '@/components/admin/PaymentsTable'

export default async function PaymentsPage() {
  const [payments, stats] = await Promise.all([getAllPayments(), getPaymentStats()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestion des paiements</h1>
        <p className="text-gray-600">{payments.length} transactions au total</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-600 mb-1">Total traité</p>
          <p className="text-2xl font-bold text-emerald-600">
            {(stats.totalProcessed / 1000).toFixed(1)}k FCFA
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-600 mb-1">En attente</p>
          <p className="text-2xl font-bold text-amber-600">{stats.totalPending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-600 mb-1">Remboursé</p>
          <p className="text-2xl font-bold text-red-600">
            {(stats.totalRefunded / 1000).toFixed(1)}k FCFA
          </p>
        </div>
      </div>

      <PaymentsTable payments={payments} />
    </div>
  )
}
