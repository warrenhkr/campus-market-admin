import {
  getFinancialKPIs,
  getMonthlyRevenue,
  getPayments,
  getWithdrawals,
} from '@/actions/finance'
import { FinancePageClient } from '@/components/admin/FinancePageClient'

export const metadata = { title: 'Finances — Admin' }

export default async function FinancePage() {
  const [kpis, monthlyRevenue, { payments }, withdrawals] = await Promise.all([
    getFinancialKPIs(),
    getMonthlyRevenue(),
    getPayments(1, 50),
    getWithdrawals(),
  ])

  return (
    <FinancePageClient
      kpis={kpis}
      monthlyRevenue={monthlyRevenue}
      payments={payments}
      withdrawals={withdrawals}
    />
  )
}