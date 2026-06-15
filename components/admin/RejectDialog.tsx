// components/admin/RejectDialog.tsx
'use client'

import { useRef, useTransition, useState } from 'react'
import { rejectVendor } from '@/actions/vendors'

type Props = {
  vendor: { id: string; shop_name: string; users: { name: string | null } }
  onSuccess: (vendorId: string, shopName: string) => void
  onClose: () => void
}

export function RejectDialog({ vendor, onSuccess, onClose }: Props) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const overlayRef = useRef<HTMLDivElement>(null)

  function handleSubmit() {
    if (!reason.trim()) {
      setError('Le motif est obligatoire pour notifier le candidat.')
      return
    }
    setError('')

    startTransition(async () => {
      const result = await rejectVendor(vendor.id, reason)
      if (result.success) {
        onSuccess(vendor.id, vendor.shop_name)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    // Overlay — fermeture au clic extérieur
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Rejeter la demande
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Boutique <strong>{vendor.shop_name}</strong> de{' '}
          {vendor.users.name ?? 'ce candidat'}.
          Un email leur sera envoyé avec votre motif.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motif du rejet <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Ex : Informations de boutique incomplètes. Veuillez ajouter une description et une photo de profil."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm
            text-gray-800 placeholder-gray-300 resize-none
            focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
        />

        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100
              rounded-lg transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !reason.trim()}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white
              rounded-lg hover:bg-red-700 disabled:opacity-50
              disabled:cursor-not-allowed transition-colors">
            {isPending ? 'Envoi...' : 'Confirmer le rejet'}
          </button>
        </div>
      </div>
    </div>
  )
}