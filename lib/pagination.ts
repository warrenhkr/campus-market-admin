import { Prisma } from '@prisma/client'

export interface PaginationParams {
  skip: number
  take: number
}

export interface PaginationResult {
  total: number
  page: number
  limit: number
  pages: number
}

export function calculatePagination(page: number, limit: number): PaginationParams {
  const skip = (page - 1) * limit
  return { skip, take: limit }
}

export function calculatePages(total: number, limit: number): number {
  return Math.ceil(total / limit)
}

export function getPaginationResult(
  total: number,
  page: number,
  limit: number,
): PaginationResult {
  return {
    total,
    page,
    limit,
    pages: calculatePages(total, limit),
  }
}

// Sort order parser
export type SortOrder = 'asc' | 'desc'

export function parseSortOrder(value: unknown): SortOrder {
  return value === 'desc' ? 'desc' : 'asc'
}

// Prisma orderBy builder
export function buildOrderBy(
  sortBy: string,
  sortOrder: SortOrder,
): Prisma.SortOrder {
  return sortOrder === 'desc' ? Prisma.SortOrder.desc : Prisma.SortOrder.asc
}

// Cursor-based pagination (optional, pour les très gros datasets)
export interface CursorPaginationParams {
  cursor?: string
  limit: number
}

export function getCursorParams(cursor: string | null, limit: number): {
  skip: number
  take: number
  cursor?: { id: string }
} {
  return {
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    take: limit + 1, // fetch one extra to know if there's a next page
  }
}
