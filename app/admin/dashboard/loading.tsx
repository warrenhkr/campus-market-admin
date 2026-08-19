export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-48 rounded-lg mb-2" style={{ background: 'var(--surface-2)' }} />
        <div className="h-4 w-72 rounded" style={{ background: 'var(--surface-2)' }} />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5 h-28"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div
          className="lg:col-span-2 rounded-xl h-64"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        />
        <div
          className="rounded-xl h-64"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div
          className="lg:col-span-2 rounded-xl h-48"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        />
        <div
          className="rounded-xl h-48"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        />
      </div>
    </div>
  )
}
