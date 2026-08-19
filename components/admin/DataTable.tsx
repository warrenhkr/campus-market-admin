'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { ReactNode, useMemo } from 'react'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], item: T) => ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: string, order: 'asc' | 'desc') => void
  onRowClick?: (item: T) => void
  rowActions?: (item: T) => ReactNode
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSort,
  onRowClick,
  rowActions,
  loading,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return

    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc'
    onSort(key, newOrder)
  }

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable || !onSort) return null

    if (sortBy === String(column.key)) {
      return sortOrder === 'asc' ? (
        <ChevronUp className="w-4 h-4 inline ml-1" />
      ) : (
        <ChevronDown className="w-4 h-4 inline ml-1" />
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                >
                  {col.label}
                </th>
              ))}
              {rowActions && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{ width: col.width }}
                className={`px-4 py-3 text-left text-sm font-medium text-gray-700 ${
                  col.sortable && onSort ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => col.sortable && handleSort(String(col.key))}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && <SortIcon column={col} />}
                </div>
              </th>
            ))}
            {rowActions && <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className={`border-b border-gray-200 hover:bg-gray-50 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-sm text-gray-900">
                  {col.render ? col.render(item[col.key], item) : String(item[col.key] || '-')}
                </td>
              ))}
              {rowActions && (
                <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                  {rowActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Pagination component
interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function Pagination({ page, totalPages, onPageChange, loading }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || loading}
          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
