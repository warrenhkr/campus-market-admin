import {
  getFinancialKPIs,
  getMonthlyRevenue,
  getPayments,
} from '@/actions/finance'
import { FinancePageClient } from '@/components/admin/FinancePageClient'

export const metadata = { title: 'Finances — Admin' }

export default async function FinancePage() {
  const [kpis, monthlyRevenue, { payments }] = await Promise.all([
    getFinancialKPIs(),
    getMonthlyRevenue(),
    getPayments(1, 50),
  ])

  return (
    <FinancePageClient
      kpis={kpis}
      monthlyRevenue={monthlyRevenue}
      payments={payments}
    />
  )
}