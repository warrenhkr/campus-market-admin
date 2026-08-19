'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateUserRole, deleteUser } from '@/actions/users'
import { Trash2, Store, ShieldCheck, User, Crown } from 'lucide-react'
import { toast } from 'sonner'

type UserRole = 'USER' | 'SELLER' | 'ADMIN'

type User = {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: Date
  seller: { id: string; shop_name: string } | null
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: React.ElementType }> = {
  USER:   { label: 'User',   color: '#3B82F6', icon: User },
  SELLER: { label: 'Seller', color: '#A3E635', icon: Store },
  ADMIN:  { label: 'Admin',  color: '#8B5CF6', icon: Crown },
}

export function UsersTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers]               = useState(initialUsers)
  const [isPending, startTransition]    = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
  const [search, setSearch]             = useState('')
  const [roleFilter, setRoleFilter]     = useState<UserRole | ''>('')

  const filtered = users.filter((u) => {
    const matchSearch = search === '' ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === '' || u.role === roleFilter
    return matchSearch && matchRole
  })

  function handleChangeRole(user: User, newRole: UserRole) {
    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole)
      if (result.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(user: User) {
    startTransition(async () => {
      const result = await deleteUser(user.id)
      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id))
        setConfirmDelete(null)
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-4 pr-4 py-2 text-sm rounded-xl outline-none"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
          className="text-sm px-3 py-2 rounded-xl outline-none"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">Tous les rôles</option>
          <option value="USER">User</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>

        <div
          className="px-3 py-2 rounded-xl text-xs font-medium flex items-center"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--muted-foreground)',
          }}
        >
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Utilisateur', 'Email', 'Rôle', 'Boutique', 'Inscrit le', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--subtle)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm"
                    style={{ color: 'var(--muted-foreground)' }}>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const role = ROLE_CONFIG[user.role]
                  const RoleIcon = role.icon
                  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase()

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Avatar + nom */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center
                              text-xs font-bold flex-shrink-0"
                            style={{
                              background: `${role.color}18`,
                              color: role.color,
                            }}
                          >
                            {initials}
                          </div>
                          <p className="font-medium text-sm"
                            style={{ color: 'var(--foreground)' }}>
                            {user.name ?? '—'}
                          </p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-sm"
                        style={{ color: 'var(--muted-foreground)' }}>
                        {user.email}
                      </td>

                      {/* Rôle */}
                      <td className="px-5 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                            font-semibold outline-none cursor-pointer disabled:opacity-50
                            transition-all"
                          style={{
                            background: `${role.color}18`,
                            border: `1px solid ${role.color}30`,
                            color: role.color,
                          }}
                        >
                          <option value="USER">User</option>
                          <option value="SELLER">Seller</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>

                      {/* Boutique */}
                      <td className="px-5 py-4">
                        {user.seller ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1
                              rounded-lg text-xs font-medium"
                            style={{
                              background: '#A3E63518',
                              color: '#A3E635',
                              border: '1px solid #A3E63530',
                            }}
                          >
                            <Store size={10} />
                            {user.seller.shop_name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--subtle)' }}>—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs"
                        style={{ color: 'var(--subtle)' }}>
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setConfirmDelete(user)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                            font-medium transition-all hover:scale-105 disabled:opacity-50"
                          style={{
                            background: '#F8717118',
                            color: '#F87171',
                            border: '1px solid #F8717130',
                          }}
                        >
                          <Trash2 size={12} />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal confirmation suppression */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: '#F8717118', border: '1px solid #F8717130' }}
              >
                <Trash2 size={20} style={{ color: '#F87171' }} />
              </div>

              <h3 className="text-lg font-bold mb-1"
                style={{ color: 'var(--foreground)' }}>
                Supprimer l&apos;utilisateur ?
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Cette action supprimera <strong style={{ color: 'var(--foreground)' }}>
                  {confirmDelete.email}
                </strong> et toutes ses données. Cette action est irréversible.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all
                    hover:scale-105 disabled:opacity-50"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all
                    hover:scale-105 disabled:opacity-50"
                  style={{ background: '#F87171', color: 'white' }}
                >
                  {isPending ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}