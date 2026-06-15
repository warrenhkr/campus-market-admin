'use client'

import { SystemAlert } from '@prisma/client'

type AdminActivityItem = {
  id: string
  action: string
  resource_type: string | null
  created_at: Date
  user: { name: string | null; email: string } | null
}

export function SystemAlertsWidget({ alerts }: { alerts: SystemAlert[] }) {
  const severityStyles: Record<string, { bg: string; border: string; color: string }> = {
    INFO:     { bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  color: '#60A5FA' },
    WARNING:  { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  color: '#FBBF24' },
    ERROR:    { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', color: '#F87171' },
    CRITICAL: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#EF4444' },
  }

  const severityIcons: Record<string, string> = {
    INFO: 'ℹ️', WARNING: '⚠️', ERROR: '❌', CRITICAL: '🚨',
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2"
        style={{ color: 'var(--foreground)' }}>
        {alerts.length > 0 ? '🔔' : '✓'} Alertes système
      </h3>
      {alerts.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Aucune alerte à afficher
        </p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const s = severityStyles[alert.severity] ?? severityStyles.INFO
            return (
              <div
                key={alert.id}
                className="rounded-lg p-3 flex items-start gap-3"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <span className="text-base mt-0.5">{severityIcons[alert.severity]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: s.color }}>
                    {alert.message}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                    {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function RecentActivityWidget({ activity }: { activity: AdminActivityItem[] }) {
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
          Activité récente
        </h3>
      </div>
      {activity.length === 0 ? (
        <p className="px-6 py-8 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
          Aucune activité récente
        </p>
      ) : (
        <div>
          {activity.map((item) => (
            <div
              key={item.id}
              className="px-6 py-3 transition-colors"
              style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {item.action}
                    {item.resource_type && (
                      <span style={{ color: 'var(--muted-foreground)' }}>
                        {' '}sur {item.resource_type}
                      </span>
                    )}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                    {item.user?.name || item.user?.email || 'Système'}
                  </p>
                </div>
                <p className="text-xs whitespace-nowrap" style={{ color: 'var(--subtle)' }}>
                  {new Date(item.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}