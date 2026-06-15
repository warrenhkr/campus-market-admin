export type SubscriptionStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NEVER_ACTIVATED'

export function getSubscriptionStatus(expiresAt: Date | null): SubscriptionStatus {
  if (!expiresAt) return 'NEVER_ACTIVATED'
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0)  return 'EXPIRED'
  if (diffDays <= 7) return 'EXPIRING_SOON'
  return 'ACTIVE'
}

export function getDaysRemaining(expiresAt: Date | null): number {
  if (!expiresAt) return 0
  const diffMs = expiresAt.getTime() - new Date().getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function getProgressPercent(expiresAt: Date | null): number {
  const days = getDaysRemaining(expiresAt)
  if (days <= 0) return 0
  return Math.min(100, Math.round((days / 30) * 100))
}

export const STATUS_CONFIG: Record<SubscriptionStatus, {
  label: string
  className: string
  barColor: string
}> = {
  ACTIVE: {
    label: 'Actif',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barColor: 'bg-emerald-500',
  },
  EXPIRING_SOON: {
    label: 'Expire bientôt',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    barColor: 'bg-amber-400',
  },
  EXPIRED: {
    label: 'Expiré',
    className: 'bg-red-50 text-red-700 border-red-200',
    barColor: 'bg-red-400',
  },
  NEVER_ACTIVATED: {
    label: 'Non activé',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
    barColor: 'bg-gray-300',
  },
}