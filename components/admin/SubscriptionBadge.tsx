import { getSubscriptionStatus, STATUS_CONFIG } from '@/lib/subscriptions'

export function SubscriptionBadge({ expiresAt }: { expiresAt: Date | null }) {
  const status = getSubscriptionStatus(expiresAt)
  const config = STATUS_CONFIG[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
      text-xs font-medium border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.barColor}`} />
      {config.label}
    </span>
  )
}