import { Prisma } from '@prisma/client'

// Helper pour construire des filtres de recherche génériques
export function buildSearchFilter(
  searchTerm: string | undefined,
  searchFields: string[],
): Prisma.Sql | undefined {
  if (!searchTerm || !searchFields.length) return undefined

  const conditions = searchFields.map((field) => Prisma.sql`${Prisma.raw(field)} ILIKE ${`%${searchTerm}%`}`)

  if (conditions.length === 1) {
    return conditions[0]
  }

  // Combine with OR
  return Prisma.sql`(${Prisma.join(conditions, ' OR ')})`
}

// Date range filter builder
export interface DateRangeFilter {
  from?: Date
  to?: Date
}

export function buildDateRangeFilter(dateRange: DateRangeFilter | undefined, field: string) {
  if (!dateRange) return undefined

  const conditions: Prisma.Sql[] = []

  if (dateRange.from) {
    conditions.push(Prisma.sql`${Prisma.raw(field)} >= ${dateRange.from}`)
  }

  if (dateRange.to) {
    const to = new Date(dateRange.to)
    to.setHours(23, 59, 59, 999)
    conditions.push(Prisma.sql`${Prisma.raw(field)} <= ${to}`)
  }

  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]

  return Prisma.sql`(${Prisma.join(conditions, ' AND ')})`
}

// Status filter
export function buildStatusFilter(status: string | undefined) {
  if (!status) return undefined
  return status
}

// Price range filter
export interface PriceRangeFilter {
  min?: number
  max?: number
}

export function buildPriceRangeFilter(priceRange: PriceRangeFilter | undefined, field = 'price') {
  if (!priceRange) return undefined

  const conditions: Prisma.Sql[] = []

  if (priceRange.min !== undefined) {
    conditions.push(Prisma.sql`${Prisma.raw(field)} >= ${priceRange.min}`)
  }

  if (priceRange.max !== undefined) {
    conditions.push(Prisma.sql`${Prisma.raw(field)} <= ${priceRange.max}`)
  }

  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]

  return Prisma.sql`(${Prisma.join(conditions, ' AND ')})`
}

// Parse query params safely
export function parseFilterParams(params: Record<string, unknown>) {
  return {
    search: typeof params.search === 'string' ? params.search.slice(0, 255) : undefined,
    status: typeof params.status === 'string' ? params.status : undefined,
    dateFrom: params.dateFrom instanceof Date ? params.dateFrom : undefined,
    dateTo: params.dateTo instanceof Date ? params.dateTo : undefined,
    page: Math.max(1, parseInt(String(params.page || 1))),
    limit: Math.min(100, Math.max(1, parseInt(String(params.limit || 20)))),
    sortBy: typeof params.sortBy === 'string' ? params.sortBy : 'created_at',
    sortOrder: params.sortOrder === 'asc' ? 'asc' : 'desc',
  }
}

// Query builder for URL
export function buildQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (value instanceof Date) {
        params.append(key, value.toISOString())
      } else {
        params.append(key, String(value))
      }
    }
  })

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}
