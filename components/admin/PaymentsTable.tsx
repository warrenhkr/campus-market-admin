'use client'

import { useState, useTransition } from 'react'
import { initiateRefund } from '@/actions/payments'

type Payment = {
  id: string
  order_id: string
  amount: number
  platform_fee: number
  seller_earning: number
  currency: string
  method: string
  transaction_id: string
  status: string
  paid_at: Date | null
  created_at: Date
  order: {
    user: { email: string }
    order_items: Array<{
      product: { shop: { seller: { shop_name: string } } }
    }>
  }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 border-amber-200 text-amber-800',
  AUTHORIZED: 'bg-blue-50 border-blue-200 text-blue-800',
  CAPTURED: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  FAILED: 'bg-red-50 border-red-200 text-red-800',
  REFUNDED: 'bg-purple-50 border-purple-200 text-purple-800',
}

export function PaymentsTable({ payments: initialPayments }: { payments: Payment[] }) {
  const [payments, setPayments] = useState(initialPayments)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [refundNote, setRefundNote] = useState<string>('')

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  function handleRefund(payment: Payment) {
    startTransition(async () => {
      const result = await initiateRefund(payment.id, refundNote)
      if (result.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === payment.id ? { ...p, status: 'REFUNDED' } : p))
        )
        showToast('success', result.message)
        setRefundNote('')
      } else {
        showToast('error', result.error)
      }
    })
  }

  return (
    <>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg
          ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                ID Transaction
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Client
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Montant
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Commission
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Statut
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Date
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-600">
                  {payment.transaction_id.slice(0, 12)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{payment.order.user.email}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  {(payment.amount / 1000).toFixed(1)}k {payment.currency}
                </td>
                <td className="px-6 py-4 text-right text-gray-600">
                  {(payment.platform_fee / 1000).toFixed(1)}k
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                      statusColors[payment.status]
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {payment.status === 'CAPTURED' && (
                      <button
                        onClick={() => handleRefund(payment)}
                        disabled={isPending}
                        className="px-2 py-1 text-xs font-medium rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                      >
                        ↩ Rembourser
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
