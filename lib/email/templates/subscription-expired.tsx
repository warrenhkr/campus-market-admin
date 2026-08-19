import * as React from 'react'

interface SubscriptionExpiredProps {
  shopName: string
  sellerName?: string
}

export function SubscriptionExpiredEmail({ shopName, sellerName }: SubscriptionExpiredProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', color: '#111' }}>
      <div style={{ background: '#6b7280', padding: '32px 24px', borderRadius: '8px 8px 0 0' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: 24 }}>Abonnement expiré</h1>
      </div>
      <div style={{ background: '#fff', padding: '32px 24px', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <p>Bonjour {sellerName ?? 'cher vendeur'},</p>
        <p>Votre abonnement pour la boutique <strong>{shopName}</strong> a expiré. Votre boutique est actuellement <strong style={{ color: '#ef4444' }}>suspendue</strong>.</p>
        <p>Renouvelez votre abonnement pour remettre votre boutique en ligne et continuer à vendre.</p>
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <a href="https://campusmarket.bj/seller/subscription"
            style={{ background: '#10b981', color: '#fff', padding: '12px 32px', borderRadius: 6, textDecoration: 'none', fontWeight: 'bold' }}>
            Renouveler maintenant
          </a>
        </div>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Pour toute question : support@campusmarket.bj</p>
      </div>
      <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        Campus Market · support@campusmarket.bj
      </p>
    </div>
  )
}