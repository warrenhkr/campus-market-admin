import {
  getCategories,
  getAllProducts,
  getAllShops,
} from '@/actions/catalog'
import { CatalogPageClient } from '@/components/admin/CatalogPageClient'

export const metadata = { title: 'Catalogue — Admin' }

export default async function CatalogPage() {
  const [categories, products, shops] = await Promise.all([
    getCategories(),
    getAllProducts(),
    getAllShops(),
  ])

  return (
    <CatalogPageClient
      categories={categories}
      products={products}
      shops={shops}
    />
  )
}