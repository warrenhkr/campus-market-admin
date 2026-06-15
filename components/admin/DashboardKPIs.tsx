'use client'

export function DashboardKPIs({ stats }: {
  stats: {
    totalUsers: number
    totalSellers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
  }
}) {
  const kpis = [
    {
      label: 'Utilisateurs totaux',
      value: stats.totalUsers.toLocaleString('fr-FR'),
      icon: '👥',
    },
    {
      label: 'Vendeurs actifs',
      value: stats.totalSellers.toLocaleString('fr-FR'),
      icon: '🏪',
    },
    {
      label: 'Produits',
      value: stats.totalProducts.toLocaleString('fr-FR'),
      icon: '📦',
    },
    {
      label: 'Commandes',
      value: stats.totalOrders.toLocaleString('fr-FR'),
      icon: '📋',
    },
    {
      label: "Chiffre d'affaires",
      value: `${(stats.totalRevenue / 1000).toFixed(1)}k FCFA`,
      icon: '💰',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl p-6 transition-all"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-border)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px var(--primary-dim)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                {kpi.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {kpi.value}
              </p>
            </div>
            <span className="text-3xl">{kpi.icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}