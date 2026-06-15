// components/admin/PaymentHistoryTable.tsx
'use client'

import { useState, useTransition } from 'react'
import { RefundDialog } from './RefundDialog'

const STATUS_STYLES: Record<string, string> = {
  CAPTURED:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING:    'bg-amber-50 text-amber-700 border-amber-200',
  AUTHORIZED: 'bg-blue-50 text-blue-700 border-blue-200',
  FAILED:     'bg-red-50 text-red-700 border-red-200',
  REFUNDED:   'bg-gray-100 text-gray-500 border-gray-200',
}

type Payment = {
  id: string
  transaction_id: string
  amount: any
  platform_fee: any
  seller_earning: any
  status: string
  currency: string
  method: string
  paid_at: Date | null
  created_at: Date
  orders: {
    id: string
    users: { name: string | null; email: string }
    order_items: {
      products: { shops: { name: string } }
    }[]
  }
}

export function PaymentHistoryTable({
  payments,
  onToast,
}: {
  payments: Payment[]
  onToast: (type: 'success' | 'error', msg: string) => void
}) {
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null)
  const [list, setList] = useState(payments)

  function handleRefundSuccess(msg: string) {
    // Met à jour le statut en local
    if (refundTarget) {
      setList(prev =>
        prev.map(p =>
          p.id === refundTarget.id ? { ...p, status: 'REFUNDED' } : p
        )
      )
    }
    setRefundTarget(null)
    onToast('success', msg)
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">ID Transaction</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Boutique</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Montant</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Commission</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Vendeur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((payment) => {
                const shopName =
                  payment.orders.order_items[0]?.products.shops.name ?? '—'
                const date = payment.paid_at ?? payment.created_at

                return (
                  <tr key={payment.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500">
                        {payment.transaction_id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs">
                        {payment.orders.users.name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {payment.orders.users.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{shopName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {Number(payment.amount).toLocaleString('fr-FR')} F
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 text-xs">
                      +{Number(payment.platform_fee).toLocaleString('fr-FR')} F
                    </td>
                    <td className="px-4 py-3 text-right text-blue-700 text-xs">
                      {Number(payment.seller_earning).toLocaleString('fr-FR')} F
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5
                        rounded-full text-xs font-medium border
                        ${STATUS_STYLES[payment.status] ?? STATUS_STYLES.PENDING}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(date).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {payment.status === 'CAPTURED' ? (
                        <button
                          onClick={() => setRefundTarget(payment)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border
                            border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                          ↩ Rembourser
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {refundTarget && (
        <RefundDialog
          payment={refundTarget}
          onSuccess={handleRefundSuccess}
          onClose={() => setRefundTarget(null)}
        />
      )}
    </>
  )
}