'use client'

import { useState, useTransition } from 'react'
import { dismissReport, resolveReport } from '@/actions/reports'

type Report = {
  id: string
  reason: string
  description: string | null
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
  created_at: Date
  reporter: { email: string; name: string | null }
  product: { id: string; name: string } | null
  seller: { id: string; shop_name: string } | null
}

export function ReportsTable({ reports: initialReports }: { reports: Report[] }) {
  const [reports, setReports] = useState(initialReports)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  function updateReport(id: string, status: Report['status']) {
    setReports((current) => current.map((report) => (report.id === id ? { ...report, status } : report)))
  }

  function handleDismiss(report: Report) {
    startTransition(async () => {
      const result = await dismissReport(report.id)
      if (result.success) {
        updateReport(report.id, 'DISMISSED')
        showToast('success', result.message)
      } else {
        showToast('error', result.error)
      }
    })
  }

  function handleResolve(report: Report) {
    startTransition(async () => {
      const result = await resolveReport(report.id, report.product ? 'DELETE_CONTENT' : 'WARNING')
      if (result.success) {
        updateReport(report.id, 'RESOLVED')
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
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Signalement</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cible</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Auteur</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-4 max-w-sm">
                  <p className="font-medium text-gray-900">{report.reason}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{report.description ?? 'Aucune description'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900">{report.product?.name ?? report.seller?.shop_name ?? 'Cible supprimee'}</p>
                  <p className="text-xs text-gray-500">{report.product ? 'Produit' : report.seller ? 'Vendeur' : 'Inconnu'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900">{report.reporter.name ?? 'Utilisateur'}</p>
                  <p className="text-xs text-gray-500">{report.reporter.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleDismiss(report)} disabled={isPending || report.status !== 'PENDING'} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      Ignorer
                    </button>
                    <button onClick={() => handleResolve(report)} disabled={isPending || report.status !== 'PENDING'} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                      Traiter
                    </button>
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
