'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

interface ExportMenuProps {
  onExportCSV?: () => void
  onExportPDF?: () => void
  onExportJSON?: () => void
  isLoading?: boolean
  disableCSV?: boolean
  disablePDF?: boolean
  disableJSON?: boolean
}

export function ExportMenu({
  onExportCSV,
  onExportPDF,
  onExportJSON,
  isLoading = false,
  disableCSV = false,
  disablePDF = false,
  disableJSON = false,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasExportOptions = onExportCSV || onExportPDF || onExportJSON

  if (!hasExportOptions) return null

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {onExportCSV && (
            <button
              onClick={() => {
                onExportCSV()
                setIsOpen(false)
              }}
              disabled={isLoading || disableCSV}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg"
            >
              Export as CSV
            </button>
          )}

          {onExportPDF && (
            <button
              onClick={() => {
                onExportPDF()
                setIsOpen(false)
              }}
              disabled={isLoading || disablePDF}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-100"
            >
              Export as PDF
            </button>
          )}

          {onExportJSON && (
            <button
              onClick={() => {
                onExportJSON()
                setIsOpen(false)
              }}
              disabled={isLoading || disableJSON}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-100 last:rounded-b-lg"
            >
              Export as JSON
            </button>
          )}
        </div>
      )}
    </div>
  )
}
