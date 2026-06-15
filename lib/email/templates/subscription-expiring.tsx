import * as React from 'react'

interface SubscriptionExpiringProps {
  shopName: string
  sellerName?: string
  expiresAt: string
  daysLeft: number
}

export function SubscriptionExpiringEmail({ shopName, sellerName, expiresAt, daysLeft }: SubscriptionExpiringProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', color: '#111' }}>
      <div style={{ background: '#f59e0b', padding: '32px 24px', borderRadius: '8px 8px 0 0' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: 24 }}>⚠️ Abonnement bientôt expiré</h1>
      </div>
      <div style={{ background: '#fff', padding: '32px 24px', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <p>Bonjour {sellerName ?? 'cher vendeur'},</p>
        <p>Votre abonnement pour la boutique <strong>{shopName}</strong> expire dans <strong style={{ color: '#f59e0b' }}>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong> ({expiresAt}).</p>
        <p>Pour continuer à vendre sans interruption, renouvelez votre abonnement avant cette date.</p>
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <a href="https://campusmarket.bj/seller/subscription"
            style={{ background: '#f59e0b', color: '#fff', padding: '12px 32px', borderRadius: 6, textDecoration: 'none', fontWeight: 'bold' }}>
            Renouveler mon abonnement
          </a>
        </div>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Ne laissez pas votre boutique s'éteindre !</p>
      </div>
      <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        Campus Market · support@campusmarket.bj
      </p>
    </div>
  )
}