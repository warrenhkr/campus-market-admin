'use client'

import { useState } from 'react'
import { CategoryManager } from './CategoryManager'
import { ProductModerationTable } from './ProductModerationTable'
import { ShopsOverview } from './ShopsOverview'

type Category = {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

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

type Shop = {
  id: string
  name: string
  slug: string
  image_url: string | null
  seller: {
    shop_name: string
    verification_status: string
    subscription_expires_at: Date | null
    user: { name: string | null; email: string }
  }
  _count: { products: number }
}

export function CatalogPageClient({
  categories,
  products,
  shops,
}: {
  categories: Category[]
  products: Product[]
  shops: Shop[]
}) {
  const [tab, setTab] = useState<'products' | 'categories' | 'shops'>('products')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Catalogue</h1>
        <p className="text-gray-600">Categories, produits et boutiques de la marketplace.</p>
      </div>

      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
        {[
          ['products', 'Produits'],
          ['categories', 'Categories'],
          ['shops', 'Boutiques'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value as any)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <ProductModerationTable products={products} categories={categories} onToast={showToast} />
      )}
      {tab === 'categories' && <CategoryManager categories={categories} onToast={showToast} />}
      {tab === 'shops' && <ShopsOverview shops={shops} />}
    </div>
  )
}
