'use client'

export function SkeletonTable({ rows = 10 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {[1, 2, 3, 4, 5].map((i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              {[1, 2, 3, 4, 5].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      <div className="h-8 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="h-64 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}
