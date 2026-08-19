'use client'

import { useState, useTransition } from 'react'
import { deleteReview, hideReview, unhideReview } from '@/actions/reviews'

type Review = {
  id: string
  rating: number
  comment: string | null
  is_verified_purchase: boolean
  is_hidden: boolean
  seller_reply: string | null
  created_at: Date
  user: { name: string | null; email: string }
  product: { name: string; id: string }
}

export function ReviewsTable({ reviews: initialReviews }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  function handleDelete(review: Review) {
    startTransition(async () => {
      const result = await deleteReview(review.id)
      if (result.success) {
        setReviews((prev) => prev.filter((r) => r.id !== review.id))
        setConfirmDelete(null)
        showToast('success', result.message)
      } else {
        showToast('error', result.error)
      }
    })
  }

  function handleToggleHidden(review: Review) {
    startTransition(async () => {
      const result = review.is_hidden ? await unhideReview(review.id) : await hideReview(review.id)
      if (result.success) {
        setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, is_hidden: !r.is_hidden } : r)))
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
                Utilisateur
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Note
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Commentaire
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                Date
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
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{review.product.name}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.user.name ?? '—'}</p>
                    <p className="text-xs text-gray-500">{review.user.email}</p>
                    {review.is_verified_purchase && (
                      <span className="mt-1 inline-block text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                        Achat vérifié
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1">
                    {'⭐'.repeat(review.rating)}
                    <span className="text-gray-600 ml-1">{review.rating}/5</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                  {review.comment ?? <span className="italic text-gray-300">Pas de commentaire</span>}
                  {review.seller_reply && (
                    <p className="mt-1 text-xs text-gray-400 truncate">↳ Réponse vendeur : {review.seller_reply}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  {review.is_hidden ? (
                    <span className="inline-flex text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      Masqué
                    </span>
                  ) : (
                    <span className="inline-flex text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Visible
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleHidden(review)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {review.is_hidden ? 'Republier' : 'Masquer'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(review)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      ✕ Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer cet avis?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr? Cette action ne peut pas être annulée.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
