'use client'

import { useState, useTransition } from 'react'
import { syncWithdrawalStatus, updateWithdrawalStatus } from '@/actions/finance'

type Withdrawal = {
  id: string
  amount: number
  method: string
  status: string
  provider_id: string | null
  created_at: Date
  seller: { shop_name: string; user: { name: string | null; email: string } }
}

export function WithdrawalRequests({
  withdrawals,
  onToast,
}: {
  withdrawals: Withdrawal[]
  onToast: (type: 'success' | 'error', msg: string) => void
}) {
  const [list, setList] = useState(withdrawals)
  const [isPending, startTransition] = useTransition()

  function update(id: string, status: 'APPROVED' | 'REJECTED') {
    startTransition(async () => {
      const result = await updateWithdrawalStatus(id, status)
      if (!result.success) {
        onToast('error', result.error)
        return
      }
      setList((current) => current.map((item) => item.id === id ? { ...item, status: status === 'APPROVED' ? 'PROCESSING' : status } : item))
      onToast('success', result.message)
    })
  }

  function sync(id: string) {
    startTransition(async () => {
      const result = await syncWithdrawalStatus(id)
      if (!result.success) onToast('error', result.error)
      else onToast('success', result.message)
      if (result.success) {
        setList((current) => current.map((item) => item.id === id ? { ...item, status: result.message.endsWith('PAID.') ? 'PAID' : result.message.endsWith('FAILED.') ? 'FAILED' : item.status } : item))
      }
    })
  }

  return (
    <section className="mt-8 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Demandes de retrait vendeur</h2>
        <p className="mt-1 text-xs text-gray-500">L&apos;approbation lance le payout FedaPay; synchronisez ensuite son statut.</p>
      </div>
      {list.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-gray-400">Aucune demande.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Vendeur</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Méthode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((withdrawal) => (
                <tr key={withdrawal.id} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{withdrawal.seller.shop_name}</p>
                    <p className="text-xs text-gray-500">{withdrawal.seller.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{withdrawal.amount.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3 text-gray-600">{withdrawal.method}</td>
                  <td className="px-4 py-3 text-xs font-medium">{withdrawal.status}</td>
                  <td className="px-4 py-3 text-right">
                    {withdrawal.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button disabled={isPending} onClick={() => update(withdrawal.id, 'APPROVED')} className="rounded-lg border border-emerald-200 px-2.5 py-1 text-xs text-emerald-700 disabled:opacity-50">Approuver</button>
                        <button disabled={isPending} onClick={() => update(withdrawal.id, 'REJECTED')} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 disabled:opacity-50">Refuser</button>
                      </div>
                    ) : withdrawal.status === 'PROCESSING' && withdrawal.provider_id ? (
                      <button disabled={isPending} onClick={() => sync(withdrawal.id)} className="rounded-lg border border-blue-200 px-2.5 py-1 text-xs text-blue-700 disabled:opacity-50">Synchroniser</button>
                    ) : <span className="text-xs text-gray-400">Traité</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}