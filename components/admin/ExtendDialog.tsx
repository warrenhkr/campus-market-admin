'use client'

import { useRef, useState, useTransition } from 'react'
import { extendSubscription } from '@/actions/subscriptions'

const DURATIONS = [
  { value: 1,  label: '1 mois',  price: '5 000 FCFA' },
  { value: 3,  label: '3 mois',  price: '13 500 FCFA' },
  { value: 6,  label: '6 mois',  price: '25 000 FCFA' },
  { value: 12, label: '12 mois', price: '45 000 FCFA' },
]

type Props = {
  seller: {
    id: string
    shop_name: string
    subscription_expires_at: Date | null
  }
  onSuccess: (message: string) => void
  onClose: () => void
}

export function ExtendDialog({ seller, onSuccess, onClose }: Props) {
  const [selectedMonths, setSelectedMonths] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  const previewDate = (() => {
    const base =
      seller.subscription_expires_at && seller.subscription_expires_at > new Date()
        ? new Date(seller.subscription_expires_at)
        : new Date()
    base.setMonth(base.getMonth() + selectedMonths)
    return base.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  })()

  function handleSubmit() {
    setError('')
    startTransition(async () => {
      const result = await extendSubscription(seller.id, selectedMonths)
      if (result.success) onSuccess(result.message)
      else setError(result.error)
    })
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Prolonger l'abonnement</h2>
        <p className="text-sm text-gray-500 mb-5">Boutique <strong>{seller.shop_name}</strong></p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedMonths(d.value)}
              className={`p-3 rounded-xl border text-left transition-all
                ${selectedMonths === d.value
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400'
                  : 'border-gray-200 hover:border-gray-300'}`}>
              <p className="font-medium text-sm text-gray-900">{d.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{d.price}</p>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-sm">
          <span className="text-gray-500">Nouvelle expiration : </span>
          <span className="font-medium text-gray-900">{previewDate}</span>
        </div>

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2 text-sm text-gray-600 border border-gray-200
              rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 py-2 text-sm font-medium bg-emerald-600 text-white
              rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {isPending ? 'Enregistrement...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}