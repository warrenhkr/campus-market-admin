// CSV Export helper
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: (keyof T)[],
) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get column headers
  const keys = columns || (Object.keys(data[0]) as (keyof T)[])

  // Create CSV header
  const header = keys.map((key) => `"${String(key)}"`).join(',')

  // Create CSV rows
  const rows = data.map((item) =>
    keys
      .map((key) => {
        const value = item[key]
        // Escape quotes and wrap in quotes if contains comma or newline
        const stringValue = String(value || '')
        const shouldQuote = stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')
        return shouldQuote ? `"${stringValue.replace(/"/g, '""')}"` : `"${stringValue}"`
      })
      .join(','),
  )

  const csv = [header, ...rows].join('\n')

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// JSON Export helper
export function exportToJSON<T>(
  data: T[],
  filename: string,
) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// Format data for display (remove IDs, format dates, etc.)
export function formatDataForExport<T extends Record<string, any>>(
  item: T,
  excludeFields: string[] = [],
): Record<string, any> {
  const result: Record<string, any> = {}

  Object.entries(item).forEach(([key, value]) => {
    if (excludeFields.includes(key)) return

    if (value instanceof Date) {
      result[key] = value.toISOString()
    } else if (typeof value === 'object' && value !== null) {
      result[key] = JSON.stringify(value)
    } else {
      result[key] = value
    }
  })

  return result
}
