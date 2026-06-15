'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { SkeletonTable } from '@/components/LoadingFallback'
import { FilterBar } from '@/components/admin/FilterBar'
import { getUsersPaginated } from '@/actions/users-paginated'
import { EnhancedUsersTable } from '@/components/admin/EnhancedUsersTable'

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

async function UsersContent({
  searchParams
}: PageProps) {
  const params = await searchParams

  const page = parseInt(params.page || '1', 10)
  const limit = parseInt(params.limit || '20', 10)
  const search = params.search || ''
  const role = params.role || ''
  const sortBy = params.sortBy || 'created_at'
  const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc'

  const result = await getUsersPaginated({
    page,
    limit,
    search,
    role: role || undefined,
    sortBy,
    sortOrder,
  })

  return (
    <EnhancedUsersTable
      users={result.data}
      page={result.pagination.page}
      totalPages={result.pagination.pages}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onPageChange={(newPage) => {
        // This would be handled by client-side navigation
      }}
      onSort={(newSortBy, newSortOrder) => {
        // This would be handled by client-side navigation
      }}
    />
  )
}

export default async function UsersPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestion des utilisateurs</h1>
        <p className="text-gray-600">Gérez tous les utilisateurs de la plateforme</p>
      </div>

      <FilterBar
        onSearch={() => {}}
        searchPlaceholder="Chercher par email ou nom..."
        filters={[
          {
            key: 'role',
            label: 'Rôle',
            type: 'select',
            options: [
              { value: 'USER', label: 'User' },
              { value: 'SELLER', label: 'Seller' },
              { value: 'ADMIN', label: 'Admin' },
            ],
          },
        ]}
      />

      <Suspense fallback={<SkeletonTable />}>
        <UsersContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
