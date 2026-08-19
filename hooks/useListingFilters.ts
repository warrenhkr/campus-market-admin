'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export interface UseListingFiltersOptions {
  defaultPage?: number
  defaultLimit?: number
}

export function useListingFilters(options: UseListingFiltersOptions = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = parseInt(searchParams.get('page') || String(options.defaultPage || 1))
  const limit = parseInt(searchParams.get('limit') || String(options.defaultLimit || 20))
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  const updateFilters = useCallback(
    (updates: Partial<{
      page: number
      limit: number
      search: string
      sortBy: string
      sortOrder: 'asc' | 'desc'
      [key: string]: any
    }>) => {
      const params = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })

      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  const setPage = useCallback(
    (newPage: number) => updateFilters({ page: newPage }),
    [updateFilters],
  )

  const setSearch = useCallback(
    (newSearch: string) => updateFilters({ search: newSearch, page: 1 }),
    [updateFilters],
  )

  const setSort = useCallback(
    (newSortBy: string, newSortOrder: 'asc' | 'desc') =>
      updateFilters({ sortBy: newSortBy, sortOrder: newSortOrder }),
    [updateFilters],
  )

  const clearFilters = useCallback(() => {
    router.push('?')
  }, [router])

  return {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    updateFilters,
    setPage,
    setSearch,
    setSort,
    clearFilters,
  }
}
