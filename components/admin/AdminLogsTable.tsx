type Log = {
  id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  changes: unknown
  metadata: unknown
  created_at: Date
  user: { email: string; name: string | null; role: string } | null
}

function asJsonPreview(value: unknown) {
  if (!value || (typeof value === 'object' && Object.keys(value as object).length === 0)) {
    return '-'
  }

  return JSON.stringify(value).slice(0, 140)
}

export function AdminLogsTable({ logs }: { logs: Log[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Admin</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Action</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cible</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Details</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{log.user?.name ?? 'Admin inconnu'}</p>
                <p className="text-xs text-gray-500">{log.user?.email ?? 'Compte supprime'}</p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-gray-900">{log.resource_type ?? '-'}</p>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">{log.resource_id ?? '-'}</p>
              </td>
              <td className="px-6 py-4 max-w-xs">
                <p className="text-xs text-gray-600 font-mono truncate">{asJsonPreview(log.changes)}</p>
                <p className="text-xs text-gray-400 font-mono truncate">{asJsonPreview(log.metadata)}</p>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">
                {new Date(log.created_at).toLocaleString('fr-FR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
