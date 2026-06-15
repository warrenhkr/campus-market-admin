import * as React from 'react'

interface VendorApprovedProps {
  shopName: string
  sellerName?: string
}

export function VendorApprovedEmail({ shopName, sellerName }: VendorApprovedProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', color: '#111' }}>
      <div style={{ background: '#10b981', padding: '32px 24px', borderRadius: '8px 8px 0 0' }}>
        <h1 style={{ color: '#fff', margin: 0, fontSize: 24 }}>🎉 Félicitations !</h1>
      </div>
      <div style={{ background: '#fff', padding: '32px 24px', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <p>Bonjour {sellerName ?? 'cher vendeur'},</p>
        <p>Votre boutique <strong>{shopName}</strong> a été <strong style={{ color: '#10b981' }}>approuvée</strong> sur Campus Market.</p>
        <p>Vous pouvez dès maintenant :</p>
        <ul>
          <li>Ajouter vos produits</li>
          <li>Personnaliser votre boutique</li>
          <li>Commencer à vendre aux étudiants</li>
        </ul>
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <a href="https://campusmarket.bj/seller"
            style={{ background: '#10b981', color: '#fff', padding: '12px 32px', borderRadius: 6, textDecoration: 'none', fontWeight: 'bold' }}>
            Accéder à mon espace vendeur
          </a>
        </div>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Bienvenue dans la communauté Campus Market 🚀</p>
      </div>
      <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        Campus Market · support@campusmarket.bj
      </p>
    </div>
  )
}