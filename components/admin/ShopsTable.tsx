'use client'

import { useState, useTransition } from 'react'
import { toggleShopSuspension } from '@/actions/shops'

type Shop = {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: Date
  productCount: number
  lowStockCount: number
  isSuspended: boolean
  seller: {
    shop_name: string
    verification_status: string
    subscription_expires_at: Date | null
    user: { email: string; name: string | null }
  }
}

export function ShopsTable({ shops: initialShops }: { shops: Shop[] }) {
  const [shops, setShops] = useState(initialShops)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  function handleToggle(shop: Shop) {
    startTransition(async () => {
      const result = await toggleShopSuspension(shop.id, !shop.isSuspended)
      if (result.success) {
        setShops((current) =>
          current.map((item) =>
            item.id === shop.id ? { ...item, isSuspended: !item.isSuspended } : item
          )
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
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Boutique</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Vendeur</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Produits</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr key={shop.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{shop.name}</p>
                  <p className="text-xs text-gray-500">/{shop.slug}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900">{shop.seller.user.name ?? shop.seller.shop_name}</p>
                  <p className="text-xs text-gray-500">{shop.seller.user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900">{shop.productCount} produits</p>
                  <p className="text-xs text-amber-600">{shop.lowStockCount} stock faible</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${shop.isSuspended ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {shop.isSuspended ? 'Suspendue' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleToggle(shop)}
                    disabled={isPending}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {shop.isSuspended ? 'Reactiver' : 'Suspendre'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
