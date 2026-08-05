// components/admin/SubscriptionTable.tsx
'use client'

import { useState, useTransition } from 'react'
import { toggleShopSuspension } from '@/actions/subscriptions'
import { ExtendDialog } from './ExtendDialog'
import { SubscriptionBadge } from './SubscriptionBadge'
import {
  getDaysRemaining,
  getProgressPercent,
  getSubscriptionStatus,
  STATUS_CONFIG,
} from '@/lib/subscriptions'

type SellerRow = {
  id: string
  shop_name: string
  subscription_plan: string
  subscription_expires_at: Date | null
  user: { name: string | null; email: string }
  shops: { id: string; name: string; slug: string }[]
}

export function SubscriptionTable({ sellers }: { sellers: SellerRow[] }) {
  const [extendTarget, setExtendTarget] = useState<SellerRow | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  function handleToggleSuspend(shop: { id: string; name: string }, suspend: boolean) {
    startTransition(async () => {
      const result = await toggleShopSuspension(shop.id, suspend)
      if (result.success) showToast('success', result.message)
      else showToast('error', result.error)
    })
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg
          text-sm font-medium border
          ${toast.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Vendeur</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Boutique</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Expiration</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide w-48">Durée restante</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => {
              const daysLeft = getDaysRemaining(seller.subscription_expires_at)
              const pct = getProgressPercent(seller.subscription_expires_at)
              const status = getSubscriptionStatus(seller.subscription_expires_at)
              const barColor = STATUS_CONFIG[status].barColor
              const shop = seller.shops[0]

              return (
                <tr key={seller.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{seller.user.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{seller.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-800">{shop?.name ?? seller.shop_name}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {seller.subscription_expires_at
                      ? new Date(seller.subscription_expires_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : <span className="italic text-gray-300">Non définie</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap min-w-[40px] text-right">
                        {daysLeft > 0 ? `${daysLeft}j` : 'Expiré'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <SubscriptionBadge expiresAt={seller.subscription_expires_at} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setExtendTarget(seller)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg
                          border border-emerald-200 text-emerald-700
                          hover:bg-emerald-50 transition-colors">
                        + Prolonger
                      </button>
                      {shop && (
                        <button
                          onClick={() => handleToggleSuspend(shop, status !== 'EXPIRED')}
                          disabled={isPending}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg
                            border border-gray-200 text-gray-600
                            hover:bg-gray-50 transition-colors disabled:opacity-50">
                          {status === 'EXPIRED' ? '↩ Réactiver' : '⊘ Suspendre'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {extendTarget && (
        <ExtendDialog
          seller={extendTarget}
          onSuccess={(msg) => { setExtendTarget(null); showToast('success', msg) }}
          onClose={() => setExtendTarget(null)}
        />
      )}
    </>
  )
}