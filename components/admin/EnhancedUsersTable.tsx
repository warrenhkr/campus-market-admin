'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { DataTable, Pagination } from '@/components/admin/DataTable'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { ExportMenu } from '@/components/admin/ExportMenu'
import { updateUserRole, suspendUser, deleteUser } from '@/actions/users'
import { exportToCSV, exportToJSON, formatDataForExport } from '@/lib/export'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  created_at: Date
  seller?: { id: string; shop_name: string } | null
}

interface UsersTableProps {
  users: User[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function EnhancedUsersTable({
  users,
  page,
  totalPages,
  onPageChange,
  onSort,
  sortBy = 'created_at',
  sortOrder = 'desc',
}: UsersTableProps) {
  const [isPending, startTransition] = useTransition()

  const handleUpdateRole = (userId: string, newRole: string) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole as any)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleSuspend = (userId: string) => {
    startTransition(async () => {
      const result = await suspendUser(userId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleExportCSV = () => {
    const formatted = users.map(u => formatDataForExport(u, ['seller']))
    exportToCSV(formatted, 'users')
    toast.success('Exported to CSV')
  }

  const handleExportJSON = () => {
    exportToJSON(users, 'users')
    toast.success('Exported to JSON')
  }

  const roleOptions = [
    { value: 'USER', label: 'User' },
    { value: 'SELLER', label: 'Seller' },
    { value: 'ADMIN', label: 'Admin' },
  ]

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800',
      SELLER: 'bg-blue-100 text-blue-800',
      USER: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{users.length} utilisateurs</div>
        <ExportMenu
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          isLoading={isPending}
        />
      </div>

      <DataTable
        data={users}
        columns={[
          {
            key: 'email',
            label: 'Email',
            sortable: true,
            width: '35%',
          },
          {
            key: 'name',
            label: 'Nom',
            sortable: false,
            width: '20%',
            render: (name) => (name as string) || '-',
          },
          {
            key: 'role',
            label: 'Rôle',
            sortable: true,
            width: '15%',
            render: (role) => (
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(role as string)}`}>
                {role as string}
              </span>
            ),
          },
          {
            key: 'created_at',
            label: 'Date',
            sortable: true,
            width: '15%',
            render: (date) => new Date(date as Date).toLocaleDateString('fr-FR'),
          },
        ]}
        sortBy={sortBy}
        sortOrder={sortOrder as any}
        onSort={onSort}
        loading={isPending}
        rowActions={(user) => (
          <div className="flex gap-2">
            <select
              value={user.role}
              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
              disabled={isPending}
              className="px-2 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <ConfirmDialog
              title="Suspendre utilisateur"
              description={`Êtes-vous sûr de vouloir suspendre ${user.email}?`}
              confirmText="Suspendre"
              isDanger
              onConfirm={() => handleSuspend(user.id)}
            >
              <button className="px-2 py-1 text-sm border border-yellow-300 rounded text-yellow-700 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Suspendre
              </button>
            </ConfirmDialog>

            <ConfirmDialog
              title="Supprimer utilisateur"
              description={`Êtes-vous sûr de vouloir supprimer ${user.email}? Cette action est irréversible.`}
              confirmText="Supprimer"
              isDanger
              onConfirm={() => handleDelete(user.id)}
            >
              <button className="px-2 py-1 text-sm border border-red-300 rounded text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Supprimer
              </button>
            </ConfirmDialog>
          </div>
        )}
        emptyMessage="Aucun utilisateur trouvé"
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={isPending}
      />
    </div>
  )
}
