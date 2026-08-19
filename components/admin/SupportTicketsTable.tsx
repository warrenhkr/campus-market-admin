'use client'

import { useState, useTransition } from 'react'
import { closeTicket } from '@/actions/support'

type Ticket = {
  id: string
  subject: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  created_at: Date
  user: { email: string; name: string | null }
  assignee: { email: string; name: string | null } | null
}

export function SupportTicketsTable({ tickets: initialTickets }: { tickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [isPending, startTransition] = useTransition()

  function handleClose(ticket: Ticket) {
    startTransition(async () => {
      const result = await closeTicket(ticket.id)
      if (result.success) {
        setTickets((current) =>
          current.map((item) => (item.id === ticket.id ? { ...item, status: 'CLOSED' } : item))
        )
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Ticket</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Client</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Priorite</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
            <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
              <td className="px-6 py-4 max-w-md">
                <p className="font-medium text-gray-900">{ticket.subject}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{ticket.description}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-gray-900">{ticket.user.name ?? 'Utilisateur'}</p>
                <p className="text-xs text-gray-500">{ticket.user.email}</p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                  {ticket.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  {ticket.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => handleClose(ticket)} disabled={isPending || ticket.status === 'CLOSED'} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Fermer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
