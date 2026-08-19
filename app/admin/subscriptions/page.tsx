import {
  getAllSellersWithSubscription,
  getSubscriptionKPIs,
  getProPlanRequests,
} from '@/actions/subscriptions'
import { SubscriptionTable } from '@/components/admin/SubscriptionTable'
import { ProPlanRequestsSection } from '@/components/admin/ProPlanRequestsSection'

export const metadata = { title: 'Abonnements — Admin' }

export default async function SubscriptionsPage() {
  const [sellers, kpis, proRequests] = await Promise.all([
    getAllSellersWithSubscription(),
    getSubscriptionKPIs(),
    getProPlanRequests(),
  ])

  const kpiCards = [
    { label: 'Vendeurs actifs',       value: kpis.active,       color: 'text-emerald-600' },
    { label: 'Expirent dans 7 jours', value: kpis.expiringSoon, color: 'text-amber-600'   },
    { label: 'Expirés',               value: kpis.expired,      color: 'text-red-600'     },
    { label: 'Total approuvés',       value: kpis.total,        color: 'text-gray-900'    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Abonnements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Suivi des accès et renouvellements vendeurs.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpiCards.map((k) => (
          <div key={k.label}
            className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              {k.label}
            </p>
            <p className={`text-3xl font-semibold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {sellers.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucun vendeur approuvé.
        </div>
      ) : (
        <SubscriptionTable sellers={sellers} />
      )}

      {/* Demandes Plan Pro */}
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Demandes plan Pro</h2>
          {proRequests.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {proRequests.length}
            </span>
          )}
        </div>
        <ProPlanRequestsSection tickets={proRequests} />
      </div>
    </div>
  )
}