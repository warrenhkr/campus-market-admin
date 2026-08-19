import * as React from 'react'

interface AdminOtpEmailProps {
  code: string
  email: string
}

export function getAdminOtpHtml(code: string, email: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #1f2937;">
      <div style="background: #2563eb; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🔒 Campus Market Admin</h1>
      </div>
      <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 15px; color: #475569; margin: 0 0 16px 0;">Bonjour,</p>
        <p style="font-size: 15px; color: #475569; margin: 0 0 24px 0;">
          Voici votre code d'accès à 6 chiffres pour vous connecter au panel d'administration :
        </p>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b; font-family: monospace;">
            ${code}
          </span>
        </div>

        <p style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">
          ⏱ Ce code est valable pendant <strong>10 minutes</strong> et ne peut être utilisé qu'une seule fois.
        </p>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Si vous n'avez pas demandé ce code pour ${email}, vous pouvez ignorer cet email en toute sécurité.
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
        Campus Market Administration · support@campusmarket.bj
      </p>
    </div>
  `
}

export function AdminOtpEmail({ code, email }: AdminOtpEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 500, margin: '0 auto', color: '#1f2937' }}>
      <div style={{ background: '#2563eb', padding: '24px', borderRadius: '12px 12px 0 0', textAlign: 'center' }}>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: 22 }}>🔒 Campus Market Admin</h1>
      </div>
      <div style={{ background: '#ffffff', padding: '32px 24px', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
        <p style={{ fontSize: 15, color: '#475569', margin: '0 0 16px 0' }}>Bonjour,</p>
        <p style={{ fontSize: 15, color: '#475569', margin: '0 0 24px 0' }}>
          Voici votre code d&apos;accès à 6 chiffres pour vous connecter au panel d&apos;administration :
        </p>

        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '24px 0' }}>
          <span style={{ fontSize: 32, fontWeight: 'bold', letterSpacing: '8px', color: '#1e293b', fontFamily: 'monospace' }}>
            {code}
          </span>
        </div>

        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px 0' }}>
          ⏱ Ce code est valable pendant <strong>10 minutes</strong> et ne peut être utilisé qu&apos;une seule fois.
        </p>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Si vous n&apos;avez pas demandé ce code pour {email}, vous pouvez ignorer cet email en toute sécurité.
        </p>
      </div>
      <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        Campus Market Administration · support@campusmarket.bj
      </p>
    </div>
  )
}
