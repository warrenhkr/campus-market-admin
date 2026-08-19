import {
  getDashboardKPIs, getMonthlyRevenue,
  getTopSellers, getExpiringSubscriptions,
} from '@/actions/dashboard'
import { DashboardKPIs } from '@/components/admin/DashboardKPIs'
import { SystemAlertsWidget, RecentActivityWidget } from '@/components/admin/DashboardWidgets'
import { MonthlyRevenueChart, TopSellersWidget } from '@/components/admin/DashboardCharts'

export default async function DashboardPage() {
  const [kpiData, monthlyRevenue, topSellers, expiringSubscriptions] = await Promise.all([
    getDashboardKPIs(), getMonthlyRevenue(), getTopSellers(), getExpiringSubscriptions(),
  ])

  const alerts = [
    ...expiringSubscriptions.map((sub) => ({
      id: `expiring-${sub.id}`,
      alert_type: 'subscription',
      severity: 'WARNING' as const,
      message: `${sub.shop_name} - Abonnement expire ${new Date(sub.subscription_expires_at!).toLocaleDateString('fr-FR')}`,
      metadata: {},
      is_read: false,
      dismissed_at: null,
      created_at: new Date(),
    })),
    ...kpiData.systemAlerts.slice(0, 2),
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Bienvenue sur le panneau d'administration Campus Market
        </p>
      </div>

      <DashboardKPIs stats={kpiData.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MonthlyRevenueChart data={monthlyRevenue} />
        </div>
        <SystemAlertsWidget alerts={alerts.slice(0, 5)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TopSellersWidget sellers={topSellers} />
        </div>
        <RecentActivityWidget activity={kpiData.recentActivity} />
      </div>
    </div>
  )
}