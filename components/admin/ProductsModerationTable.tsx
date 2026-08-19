'use client'

import { useState, useTransition } from 'react'
import { approveProduct, rejectProduct, hideProduct, deleteProduct } from '@/actions/products-moderation'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'HIDDEN'
  shop: { name: string }
  category: { name: string } | null
  _count: { reviews: number; order_items: number }
}

const statusColors: Record<string, string> = {
  PENDING_REVIEW: 'bg-amber-50 border-amber-200 text-amber-800',
  APPROVED: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  REJECTED: 'bg-red-50 border-red-200 text-red-800',
  HIDDEN: 'bg-gray-50 border-gray-200 text-gray-800',
}

export function ProductsModerationTable({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ product: Product; action: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  function handleApprove(product: Product) {
    startTransition(async () => {
      const result = await approveProduct(product.id)
      if (result.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: 'APPROVED' } : p))
        )
        showToast('success', result.message)
      } else {
        showToast('error', result.error)
      }
    })
  }

  function handleReject(product: Product) {
    startTransition(async () => {
      const result = await rejectProduct(product.id)
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id))
        setConfirmAction(null)
        showToast('success', result.message)
      } else {
        showToast('error', result.error)
      }
    })
  }

  function handleDelete(product: Product) {
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id))
        setConfirmAction(null)
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
                Produit
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Boutique
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Prix
              </th>
              <th className="text-center px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Stock
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Statut
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.category?.name} • {product._count.reviews} avis
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{product.shop.name}</td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  {(product.price / 1000).toFixed(1)}k FCFA
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      product.stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                      statusColors[product.status]
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {product.status === 'PENDING_REVIEW' && (
                      <>
                        <button
                          onClick={() => handleApprove(product)}
                          disabled={isPending}
                          className="px-2 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setConfirmAction({ product, action: 'reject' })}
                          disabled={isPending}
                          className="px-2 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </>
                    )}
                    {product.status === 'APPROVED' && (
                      <button
                        onClick={() => setConfirmAction({ product, action: 'delete' })}
                        disabled={isPending}
                        className="px-2 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction.action === 'reject' ? 'Rejeter ce produit?' : 'Supprimer ce produit?'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              "{confirmAction.product.name}"
              {confirmAction.action === 'reject'
                ? ' sera rejeté et non visible dans la marketplace.'
                : ' sera supprimé définitivement.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (confirmAction.action === 'reject') handleReject(confirmAction.product)
                  else handleDelete(confirmAction.product)
                }}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
