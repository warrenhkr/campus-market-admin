import { getFinancialKPIs, getMonthlyRevenue } from '@/actions/finance'
import { getTopSellers } from '@/actions/dashboard'
import { RevenueChart } from '@/components/admin/RevenueChart'

export const metadata = { title: 'Analytics - Admin' }

function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AnalyticsPage() {
  const [financial, monthlyRevenue, topSellers] = await Promise.all([
    getFinancialKPIs(),
    getMonthlyRevenue(),
    getTopSellers(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Analytics revenus</h1>
        <p className="text-gray-600">Chiffre d'affaires, commissions et vendeurs principaux.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">CA total</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(financial.totalRevenue)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Commissions</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(financial.platformFee)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Revenus vendeurs</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(financial.sellerEarnings)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Paiements reussis</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{financial.successfulPayments}</p>
        </div>
      </div>

      <RevenueChart data={monthlyRevenue} />

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Top vendeurs</h2>
        <div className="space-y-3">
          {topSellers.map((seller, index) => (
            <div key={seller.sellerId} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{seller.shopName}</p>
                  <p className="text-xs text-gray-500">{seller.totalOrders} commandes</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(seller.totalRevenue)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
