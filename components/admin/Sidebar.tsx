'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, Store, ShoppingBag, Package,
  ShoppingCart, CreditCard, BadgeCheck, BarChart2, Flag,
  Star, Bell, Headphones, Tag, ScrollText, Settings, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const NAV_GROUPS = [
  {
    label: 'Général',
    links: [
      { href: '/admin/dashboard',     label: 'Dashboard',     Icon: LayoutDashboard },
      { href: '/admin/users',         label: 'Utilisateurs',  Icon: Users },
      { href: '/admin/vendors',       label: 'Vendeurs',      Icon: Store },
      { href: '/admin/shops',         label: 'Boutiques',     Icon: ShoppingBag },
    ],
  },
  {
    label: 'Catalogue',
    links: [
      { href: '/admin/products',      label: 'Produits',      Icon: Package },
      { href: '/admin/catalog',       label: 'Catégories',    Icon: Tag },
      { href: '/admin/reviews',       label: 'Avis',          Icon: Star },
      { href: '/admin/reports',       label: 'Signalements',  Icon: Flag },
    ],
  },
  {
    label: 'Commerce',
    links: [
      { href: '/admin/orders',        label: 'Commandes',     Icon: ShoppingCart },
      { href: '/admin/payments',      label: 'Paiements',     Icon: CreditCard },
      { href: '/admin/subscriptions', label: 'Abonnements',   Icon: BadgeCheck },
      { href: '/admin/analytics',     label: 'Analytics',     Icon: BarChart2 },
    ],
  },
  {
    label: 'Système',
    links: [
      { href: '/admin/alerts',        label: 'Alertes',       Icon: Bell },
      { href: '/admin/support',       label: 'Support',       Icon: Headphones },
      { href: '/admin/notifications', label: 'Notifications', Icon: Bell },
      { href: '/admin/logs',          label: 'Logs',          Icon: ScrollText },
      { href: '/admin/settings',      label: 'Paramètres',    Icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-[220px] h-screen flex flex-col flex-shrink-0"
      style={{
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary)' }}
          >
            <ShoppingBag size={14} style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <div>
            <p className="font-semibold text-sm leading-none"
              style={{ color: 'var(--foreground)' }}>
              Campus Market
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--subtle)' }}>
              Administration
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-5 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5"
              style={{ color: 'var(--subtle)' }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.links.map(({ href, label, Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Tooltip key={href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        )}
                        style={{
                          background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                          color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-foreground)',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
                            ;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLElement).style.color = 'var(--sidebar-foreground)'
                          }
                        }}
                      >
                        <Icon size={15} className="flex-shrink-0" />
                        <span className="truncate">{label}</span>
                        {isActive && (
                          <ChevronRight size={12} className="ml-auto flex-shrink-0"
                            style={{ color: 'var(--primary)' }} />
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
      >
        <Link
          href="/admin/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
          style={{ color: 'var(--sidebar-foreground)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{
              background: 'var(--primary-dim)',
              color: 'var(--primary)',
            }}
          >
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>
              Admin
            </p>
            <p className="text-[10px] truncate" style={{ color: 'var(--subtle)' }}>
              Campus Market
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}