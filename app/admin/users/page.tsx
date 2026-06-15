import { getAllUsers } from '@/actions/users'
import { UsersTable } from '@/components/admin/UsersTable'
import { Users } from 'lucide-react'

export default async function UsersPage() {
  const users = await getAllUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1"
            style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
            Utilisateurs
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-border)' }}
        >
          <Users size={18} style={{ color: 'var(--primary)' }} />
        </div>
      </div>

      <UsersTable users={users} />
    </div>
  )
}