'use client'

import { useState } from 'react'
import { assignProPlan } from '@/actions/subscriptions'

interface ProTicket {
  id: string
  subject: string
  created_at: Date
  user: {
    id: string
    email: string
    name: string | null
    seller: {
      id: string
      shop_name: string
      subscription_plan: string
    } | null
  }
}

export function ProPlanRequestsSection({ tickets }: { tickets: ProTicket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
        Aucune demande de plan Pro en attente.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <ProTicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}

function ProTicketCard({ ticket }: { ticket: ProTicket }) {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const seller = ticket.user.seller

  const handleAssign = async () => {
    if (!seller) return
    setLoading(true)
    setResult(null)
    const res = await assignProPlan(seller.id, days)
    setResult({ success: res.success, message: res.success ? res.message : (res as any).error })
    setLoading(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {ticket.user.name ?? ticket.user.email}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{ticket.user.email}</p>
          <p className="text-xs text-gray-500 mt-2">
            Boutique :{' '}
            <span className="font-medium text-gray-700">{seller?.shop_name ?? '—'}</span>{' '}
            <span className="text-xs text-gray-400">
              (plan actuel : {seller?.subscription_plan ?? '—'})
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Ticket créé le{' '}
            {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {seller ? (
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Jours de validité :</label>
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleAssign}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Activation...' : 'Assigner le plan Pro'}
            </button>
          </div>
        ) : (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
            Aucun profil vendeur lié
          </span>
        )}
      </div>

      {result && (
        <div
          className={`mt-3 text-sm px-3 py-2 rounded-lg ${
            result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  )
}
