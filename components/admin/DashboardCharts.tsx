'use client'

export function TopSellersWidget({ sellers }: {
  sellers: Array<{
    sellerId: string
    shopName: string
    totalOrders: number
    totalRevenue: number
  }>
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
      >
        <h3 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
          Top vendeurs
        </h3>
      </div>
      {sellers.length === 0 ? (
        <p className="px-6 py-8 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
          Aucun vendeur pour le moment
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wide"
                style={{ color: 'var(--muted-foreground)' }}>
                Boutique
              </th>
              <th className="text-right px-6 py-3 font-medium text-xs uppercase tracking-wide"
                style={{ color: 'var(--muted-foreground)' }}>
                Commandes
              </th>
              <th className="text-right px-6 py-3 font-medium text-xs uppercase tracking-wide"
                style={{ color: 'var(--muted-foreground)' }}>
                Revenus
              </th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr
                key={seller.sellerId}
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-6 py-4 font-medium" style={{ color: 'var(--foreground)' }}>
                  {seller.shopName}
                </td>
                <td className="px-6 py-4 text-right" style={{ color: 'var(--muted-foreground)' }}>
                  {seller.totalOrders.toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right font-medium" style={{ color: 'var(--success)' }}>
                  {(seller.totalRevenue / 1000).toFixed(1)}k FCFA
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function MonthlyRevenueChart({ data }: {
  data: Array<{ month: string; revenue: number }>
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
        Revenus mensuels (12 mois)
      </h3>
      <div className="h-64 flex items-end gap-1">
        {data.map((item) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${Math.max((item.revenue / maxRevenue) * 100, 5)}%`,
                background: 'var(--primary)',
                opacity: 0.8,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.opacity = '1'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px var(--primary-dim)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.opacity = '0.8'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
              title={`${item.month}: ${(item.revenue / 1000).toFixed(1)}k FCFA`}
            />
            <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
              {item.month.split('-')[1]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}