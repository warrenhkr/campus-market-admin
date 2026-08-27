// components/admin/FinancePageClient.tsx
'use client'

import { useState } from 'react'
import { FinanceKPIs } from './FinanceKPIs'
import { RevenueChart } from './RevenueChart'
import { PaymentHistoryTable } from './PaymentHistoryTable'
import { WithdrawalRequests } from './WithdrawalRequests'

type FinancePageProps = {
  kpis: Parameters<typeof FinanceKPIs>[0]['kpis']
  monthlyRevenue: Parameters<typeof RevenueChart>[0]['data']
  payments: Parameters<typeof PaymentHistoryTable>[0]['payments']
  withdrawals: Parameters<typeof WithdrawalRequests>[0]['withdrawals']
}

export function FinancePageClient({ kpis, monthlyRevenue, payments, withdrawals }: FinancePageProps) {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg
          text-sm font-medium border
          ${toast.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard financier</h1>
        <p className="mt-1 text-sm text-gray-500">
          Transactions FedaPay, commissions et remboursements.
        </p>
      </div>

      <FinanceKPIs kpis={kpis} />
      <RevenueChart data={monthlyRevenue} />

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Historique des transactions
        </p>
        <span className="text-xs text-gray-400">
          {payments.length} transaction{payments.length > 1 ? 's' : ''}
        </span>
      </div>

      <PaymentHistoryTable payments={payments} onToast={showToast} />
      <WithdrawalRequests withdrawals={withdrawals} onToast={showToast} />
    </div>
  )
}