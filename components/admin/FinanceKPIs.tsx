// components/admin/FinanceKPIs.tsx

type KPIs = {
  totalRevenue: number
  platformFee: number
  sellerEarnings: number
  pendingPlatformFees: number
  availablePlatformFees: number
  totalRefunded: number
  failedCount: number
  ordersCount: number
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

export function FinanceKPIs({ kpis }: { kpis: KPIs }) {
  const cards = [
    {
      label: 'CA Total',
      value: fmt(kpis.totalRevenue),
      sub: `${kpis.ordersCount} commandes`,
      color: 'text-gray-900',
      border: 'border-gray-200',
    },
    {
      label: 'Profit plateforme',
      value: fmt(kpis.platformFee),
      sub: kpis.totalRevenue > 0
        ? `${((kpis.platformFee / kpis.totalRevenue) * 100).toFixed(1)}% de commission`
        : '—',
      color: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    {
      label: 'Reversé aux vendeurs',
      value: fmt(kpis.sellerEarnings),
      sub: 'Après commission',
      color: 'text-blue-700',
      border: 'border-blue-200',
    },
    {
      label: 'Remboursements',
      value: fmt(kpis.totalRefunded),
      sub: `${kpis.failedCount} paiement${kpis.failedCount > 1 ? 's' : ''} échoué${kpis.failedCount > 1 ? 's' : ''}`,
      color: 'text-red-600',
      border: 'border-red-200',
    },
    {
      label: 'Commissions en attente',
      value: fmt(kpis.pendingPlatformFees),
      sub: 'Paiements non confirmés',
      color: 'text-amber-700',
      border: 'border-amber-200',
    },
    {
      label: 'Commissions disponibles',
      value: fmt(kpis.availablePlatformFees),
      sub: 'Ledger des paiements capturés',
      color: 'text-emerald-700',
      border: 'border-emerald-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.label}
          className={`bg-white border ${c.border} rounded-xl p-4`}>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{c.label}</p>
          <p className={`text-xl font-semibold ${c.color}`}>{c.value}</p>
          <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}