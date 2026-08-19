'use client'

import { useState, useTransition } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/actions/catalog'

type Category = {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

export function CategoryManager({
  categories,
  onToast,
}: {
  categories: Category[]
  onToast: (type: 'success' | 'error', msg: string) => void
}) {
  const [list, setList] = useState(categories)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    if (!newName.trim()) return
    startTransition(async () => {
      const result = await createCategory(newName)
      if (result.success) { setNewName(''); onToast('success', result.message) }
      else onToast('error', result.error)
    })
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) return
    startTransition(async () => {
      const result = await updateCategory(id, editName)
      if (result.success) {
        setList(prev => prev.map(c => c.id === id ? { ...c, name: editName } : c))
        setEditingId(null)
        onToast('success', result.message)
      } else onToast('error', result.error)
    })
  }

  function handleDelete(id: string, name: string, count: number) {
    const msg = count > 0
      ? `Supprimer "${name}" ? ${count} produit(s) perdront leur catégorie.`
      : `Supprimer "${name}" ?`
    if (!window.confirm(msg)) return
    startTransition(async () => {
      const result = await deleteCategory(id)
      if (result.success) {
        setList(prev => prev.filter(c => c.id !== id))
        onToast('success', result.message)
      } else onToast('error', result.error)
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Catégories ({list.length})
        </p>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Nouvelle catégorie..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5
            focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <button
          onClick={handleCreate}
          disabled={isPending || !newName.trim()}
          className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white
            rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors">
          + Ajouter
        </button>
      </div>

      <ul>
        {list.map((cat) => (
          <li key={cat.id}
            className="flex items-center gap-2 px-4 py-2.5 border-b
              border-gray-50 last:border-0 hover:bg-gray-50/60">
            {editingId === cat.id ? (
              <>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate(cat.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 text-sm border border-emerald-300 rounded-lg
                    px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <button onClick={() => handleUpdate(cat.id)} disabled={isPending}
                  className="text-xs text-emerald-600 font-medium hover:underline">
                  ✓ Sauver
                </button>
                <button onClick={() => setEditingId(null)}
                  className="text-xs text-gray-400 hover:underline">
                  Annuler
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-800">{cat.name}</span>
                <span className="text-xs text-gray-400 mr-1">
                  {cat._count.products} produit{cat._count.products > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                  className="text-xs text-gray-400 hover:text-gray-700 px-1">✎</button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                  className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}