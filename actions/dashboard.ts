'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Accès refusé.')
  return user.id
}

export async function getDashboardKPIs() {
  await assertAdmin()

  const [
    totalUsers,
    totalSellers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentActivity,
    systemAlerts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.seller.count({
      where: { verification_status: 'APPROVED' },
    }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.payment.aggregate({
      where: { status: 'CAPTURED' },
      _sum: { amount: true },
    }),
    prisma.adminLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        resource_type: true,
        created_at: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.systemAlert.findMany({
      where: { is_read: false },
      orderBy: { created_at: 'desc' },
      take: 5,
    }),
  ])

  return {
    stats: {
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
    },
    recentActivity,
    systemAlerts,
  }
}

export async function getMonthlyRevenue() {
  await assertAdmin()

  const last12Months = await prisma.$queryRaw<
    Array<{ month: string; total: number }>
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') as month,
      COALESCE(SUM(amount), 0)::FLOAT as total
    FROM payments
    WHERE status = 'CAPTURED'
      AND paid_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', paid_at)
    ORDER BY DATE_TRUNC('month', paid_at) ASC
  `

  return last12Months.map((row) => ({
    month: row.month,
    revenue: Number(row.total),
  }))
}

export async function getTopSellers() {
  await assertAdmin()

  const topSellers = await prisma.$queryRaw<
    Array<{
      seller_id: string
      shop_name: string
      total_orders: number
      total_revenue: number
    }>
  >`
    SELECT
      s.id as seller_id,
      s.shop_name,
      COUNT(o.id)::INT as total_orders,
      COALESCE(SUM(p.amount), 0)::FLOAT as total_revenue
    FROM sellers s
    LEFT JOIN shops sh ON s.id = sh.seller_id
    LEFT JOIN products pr ON sh.id = pr.shop_id
    LEFT JOIN order_items oi ON pr.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    LEFT JOIN payments p ON o.payment_id = p.id AND p.status = 'CAPTURED'
    GROUP BY s.id, s.shop_name
    ORDER BY total_revenue DESC
    LIMIT 5
  `

  return topSellers.map((row) => ({
    sellerId: row.seller_id,
    shopName: row.shop_name,
    totalOrders: Number(row.total_orders),
    totalRevenue: Number(row.total_revenue),
  }))
}

export async function getExpiringSubscriptions() {
  await assertAdmin()

  const expiringIn30Days = new Date()
  expiringIn30Days.setDate(expiringIn30Days.getDate() + 30)

  return prisma.seller.findMany({
    where: {
      verification_status: 'APPROVED',
      subscription_expires_at: {
        lte: expiringIn30Days,
        gt: new Date(),
      },
    },
    select: {
      id: true,
      shop_name: true,
      subscription_expires_at: true,
      user: { select: { email: true } },
    },
  })
}
