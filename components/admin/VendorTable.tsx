'use client'

import { useState, useTransition } from 'react'
import { approveVendor } from '@/actions/vendors'
import { RejectDialog } from './RejectDialog'

type Vendor = {
  id: string
  shop_name: string
  description: string | null
  created_at: Date
  user: {          // ← singulier
    id: string
    email: string
    name: string | null
  }
}

export function VendorTable({ vendors }: { vendors: Vendor[] }) {
  const [optimisticList, setOptimisticList] = useState(vendors)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{type:'success'|'error', msg:string} | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Vendor | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  function handleApprove(vendor: Vendor) {
    setOptimisticList(prev => prev.filter(v => v.id !== vendor.id))
    startTransition(async () => {
      const result = await approveVendor(vendor.id)
      if (!result.success) {
        setOptimisticList(prev => [...prev, vendor])
        showToast('error', result.error)
      } else {
        showToast('success', `${vendor.shop_name} approuvée — rôle SELLER activé.`)
      }
    })
  }

  function handleRejectSuccess(vendorId: string, shopName: string) {
    setOptimisticList(prev => prev.filter(v => v.id !== vendorId))
    setRejectTarget(null)
    showToast('success', `${shopName} rejetée. Email envoyé.`)
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all
          ${toast.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Candidat</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Boutique</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Description</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Date</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {optimisticList.map((vendor) => (
              <tr key={vendor.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                      {(vendor.user.name ?? vendor.user.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.user.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{vendor.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">{vendor.shop_name}</td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                  {vendor.description ?? <span className="italic text-gray-300">Aucune</span>}
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {new Date(vendor.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleApprove(vendor)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      ✓ Approuver
                    </button>
                    <button
                      onClick={() => setRejectTarget(vendor)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      ✕ Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejectTarget && (
        <RejectDialog
          vendor={rejectTarget}
          onSuccess={(id, name) => handleRejectSuccess(id, name)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </>
  )
}