// components/admin/RefundDialog.tsx
'use client'

import { useRef, useTransition } from 'react'
import { initiateRefund } from '@/actions/finance'

type Payment = {
  id: string
  transaction_id: string
  amount: any
}

type Props = {
  payment: Payment
  onSuccess: (msg: string) => void
  onClose: () => void
}

export function RefundDialog({ payment, onSuccess, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const overlayRef = useRef<HTMLDivElement>(null)

  function handleConfirm() {
    startTransition(async () => {
      const result = await initiateRefund(payment.id)
      if (result.success) onSuccess(result.message)
      else alert(result.error) // Remplacer par un toast si préféré
    })
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Confirmer le remboursement
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Cette action est irréversible. Le montant sera recrédité via FedaPay
          et la commande passera en statut <strong>CANCELLED</strong>.
        </p>

        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction</span>
            <span className="font-mono text-xs text-gray-700">
              {payment.transaction_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Montant</span>
            <span className="font-semibold text-red-600">
              {Number(payment.amount).toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2 text-sm border border-gray-200 rounded-xl
              text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 py-2 text-sm font-medium bg-red-600 text-white
              rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isPending ? 'Traitement...' : 'Rembourser'}
          </button>
        </div>
      </div>
    </div>
  )
}