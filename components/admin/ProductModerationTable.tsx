'use client'

import { useState, useTransition } from 'react'
import { toggleProductVisibility } from '@/actions/catalog'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  is_available: boolean
  image_url: string | null
  shop: { name: string; slug: string }
  category: { name: string } | null
  _count: { reviews: number; order_items: number }
}

type FilterState = {
  search: string
  category: string
  availability: 'ALL' | 'VISIBLE' | 'HIDDEN'
}

export function ProductModerationTable({
  products,
  categories,
  onToast,
}: {
  products: Product[]
  categories: { id: string; name: string }[]
  onToast: (type: 'success' | 'error', msg: string) => void
}) {
  const [list, setList] = useState(products)
  const [filters, setFilters] = useState<FilterState>({
    search: '', category: 'ALL', availability: 'ALL',
  })
  const [isPending, startTransition] = useTransition()

  const filtered = list.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.shop.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchCat = filters.category === 'ALL' || p.category?.name === filters.category
    const matchAvail =
      filters.availability === 'ALL' ||
      (filters.availability === 'VISIBLE' && p.is_available) ||
      (filters.availability === 'HIDDEN' && !p.is_available)
    return matchSearch && matchCat && matchAvail
  })

  function handleToggle(product: Product) {
    const next = !product.is_available
    setList(prev => prev.map(p => p.id === product.id ? { ...p, is_available: next } : p))
    startTransition(async () => {
      const result = await toggleProductVisibility(product.id, next)
      if (!result.success) {
        setList(prev => prev.map(p => p.id === product.id ? { ...p, is_available: !next } : p))
        onToast('error', result.error)
      } else {
        onToast(next ? 'success' : 'error', result.message)
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Rechercher produit ou boutique..."
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-64
            focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white
            focus:outline-none focus:ring-2 focus:ring-emerald-200">
          <option value="ALL">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select
          value={filters.availability}
          onChange={(e) => setFilters(f => ({ ...f, availability: e.target.value as FilterState['availability'] }))}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white
            focus:outline-none focus:ring-2 focus:ring-emerald-200">
          <option value="ALL">Tous</option>
          <option value="VISIBLE">Visibles</option>
          <option value="HIDDEN">Masqués</option>
        </select>
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} produit{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Produit</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Boutique</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Catégorie</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Prix</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Stock</th>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Visibilité</th>
            <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                Aucun produit ne correspond aux filtres.
              </td>
            </tr>
          ) : filtered.map((product) => (
            <tr key={product.id}
              className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors
                ${!product.is_available ? 'opacity-60' : ''}`}>
              <td className="px-6 py-3">
                <span className="font-medium text-gray-900 max-w-[180px] truncate block">
                  {product.name}
                </span>
              </td>
              <td className="px-6 py-3 text-gray-600">{product.shop.name}</td>
              <td className="px-6 py-3">
                {product.category
                  ? <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category.name}</span>
                  : <span className="text-xs text-gray-300 italic">—</span>}
              </td>
              <td className="px-6 py-3 font-medium text-gray-800">
                {Number(product.price).toLocaleString('fr-FR')} FCFA
              </td>
              <td className="px-6 py-3 text-gray-600">{product.stock}</td>
              <td className="px-6 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                  text-xs font-medium border
                  ${product.is_available
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                    ${product.is_available ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {product.is_available ? 'Visible' : 'Masqué'}
                </span>
              </td>
              <td className="px-6 py-3 text-right">
                <button
                  onClick={() => handleToggle(product)}
                  disabled={isPending}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border
                    transition-colors disabled:opacity-50
                    ${product.is_available
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>
                  {product.is_available ? '⊘ Masquer' : '↩ Afficher'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}