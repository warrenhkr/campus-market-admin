'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus, cancelOrder } from '@/actions/orders'

type Order = {
  id: string
  order_date: Date
  total_amount: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED'
  user: { email: string; name: string | null }
  payment: { status: string; transaction_id: string } | null
  _count: { order_items: number }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 border-amber-200 text-amber-800',
  COMPLETED: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  SHIPPED: 'bg-blue-50 border-blue-200 text-blue-800',
  DELIVERED: 'bg-green-50 border-green-200 text-green-800',
  CANCELLED: 'bg-red-50 border-red-200 text-red-800',
}

export function OrdersTable({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  function handleStatusChange(order: Order, newStatus: string) {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, newStatus as any)
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: newStatus as any } : o))
        )
        showToast('success', result.message)
      } else {
        showToast('error', result.error)
      }
    })
  }

  function handleCancel(order: Order) {
    startTransition(async () => {
      const result = await cancelOrder(order.id)
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: 'CANCELLED' } : o))
        )
        showToast('success', result.message)
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
                ID Commande
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Client
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Total
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Statut
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Items
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
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-600">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.user.name ?? '—'}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">
                  {(order.total_amount / 1000).toFixed(1)}k
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{order._count.order_items} articles</td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(order.order_date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      disabled={isPending || order.status === 'CANCELLED'}
                      className="px-2 py-1 text-xs rounded border border-gray-300 bg-white disabled:opacity-50"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
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
