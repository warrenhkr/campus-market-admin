'use client'

type MonthRow = { month: string; revenue: number; fees: number }

function formatMonth(ym: string) {
  const [year, month] = ym.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('fr-FR', {
    month: 'short',
    year: '2-digit',
  })
}

export function RevenueChart({ data }: { data: MonthRow[] }) {
  const maxRevenue = Math.max(...data.map((row) => row.revenue), 1)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-medium text-gray-700">Revenus - 6 derniers mois</p>
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />CA</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Commission</span>
        </div>
      </div>
      <div className="h-60 flex items-end gap-3">
        {data.map((row) => {
          const revenueHeight = Math.max((row.revenue / maxRevenue) * 100, 4)
          const feeHeight = Math.max((row.fees / maxRevenue) * 100, 2)

          return (
            <div key={row.month} className="flex-1 min-w-0 flex flex-col items-center gap-2">
              <div className="w-full h-48 flex items-end justify-center gap-1">
                <div
                  className="w-5 rounded-t bg-emerald-500"
                  style={{ height: `${revenueHeight}%` }}
                  title={`${row.revenue.toLocaleString('fr-FR')} FCFA`}
                />
                <div
                  className="w-5 rounded-t bg-blue-500"
                  style={{ height: `${feeHeight}%` }}
                  title={`${row.fees.toLocaleString('fr-FR')} FCFA`}
                />
              </div>
              <span className="text-[11px] text-gray-500 truncate">{formatMonth(row.month)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
