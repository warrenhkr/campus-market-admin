import * as React from 'react'

interface VendorRejectedProps {
  shopName: string
  sellerName?: string
  reason?: string
}

export function VendorRejectedEmail({ shopName, sellerName, reason }: VendorRejectedProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', color: '#111' }}>
      <div style={{ background: '#ef4444', padding: '32px 24px', borderRadius: '8px 8px 0 0' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: 24 }}>Demande non approuvée</h1>
      </div>
      <div style={{ background: '#fff', padding: '32px 24px', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <p>Bonjour {sellerName ?? 'cher candidat'},</p>
        <p>Après examen, votre demande d'ouverture de la boutique <strong>{shopName}</strong> n'a pas pu être approuvée.</p>
        {reason && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '12px 16px', margin: '16px 0' }}>
            <p style={{ margin: 0, color: '#b91c1c', fontSize: 14 }}><strong>Motif :</strong> {reason}</p>
          </div>
        )}
        <p>Vous pouvez soumettre une nouvelle demande après avoir corrigé les points mentionnés.</p>
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <a href="https://campusmarket.bj/become-seller"
            style={{ background: '#111', color: '#fff', padding: '12px 32px', borderRadius: 6, textDecoration: 'none', fontWeight: 'bold' }}>
            Soumettre une nouvelle demande
          </a>
        </div>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Pour toute question, contactez-nous à support@campusmarket.bj</p>
      </div>
      <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        Campus Market · support@campusmarket.bj
      </p>
    </div>
  )
}