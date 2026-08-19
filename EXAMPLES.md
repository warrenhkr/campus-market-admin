# Exemples pratiques d'intégration

Ce fichier montre des exemples concrets pour intégrer les nouveaux composants.

## 1. Créer une action serveur paginated

```typescript
// actions/products-paginated.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { calculatePagination, getPaginationResult } from '@/lib/pagination'
import { z } from 'zod'

const getProductsFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(255).optional(),
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'HIDDEN']).optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function getProductsPaginated(filters: unknown) {
  const parsed = getProductsFilterSchema.parse(filters)
  const { skip, take } = calculatePagination(parsed.page, parsed.limit)

  const whereClause: any = {}

  if (parsed.status) whereClause.status = parsed.status
  if (parsed.search) {
    whereClause.OR = [
      { name: { contains: parsed.search, mode: 'insensitive' } },
      { description: { contains: parsed.search, mode: 'insensitive' } },
    ]
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        price: true,
        status: true,
        stock: true,
        created_at: true,
        shop: { select: { name: true } },
      },
      orderBy: { [parsed.sortBy]: parsed.sortOrder },
      skip,
      take,
    }),
    prisma.product.count({ where: whereClause }),
  ])

  return {
    data: products,
    pagination: getPaginationResult(total, parsed.page, parsed.limit),
  }
}
```

## 2. Créer une table de liste

```typescript
// components/admin/ProductsTable.tsx
'use client'

import { DataTable, Pagination } from '@/components/admin/DataTable'
import { StatusBadge, getStatusVariant } from '@/components/admin/StatusBadge'
import { ExportMenu } from '@/components/admin/ExportMenu'
import { useNotification } from '@/hooks/useNotification'
import { exportToCSV } from '@/lib/export'

export function ProductsTable({ products, page, totalPages, onPageChange }) {
  const { success } = useNotification()

  const handleExport = () => {
    exportToCSV(products, 'products')
    success('Exporté en CSV')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">{products.length} produits</span>
        <ExportMenu onExportCSV={handleExport} />
      </div>

      <DataTable
        data={products}
        columns={[
          { key: 'name', label: 'Nom', sortable: true, width: '30%' },
          { key: 'price', label: 'Prix', sortable: true, width: '15%' },
          {
            key: 'status',
            label: 'Statut',
            sortable: true,
            width: '15%',
            render: (status) => (
              <StatusBadge
                status={status as string}
                variant={getStatusVariant(status as string)}
              />
            ),
          },
          { key: 'stock', label: 'Stock', sortable: false, width: '10%' },
          {
            key: 'shop',
            label: 'Boutique',
            render: (shop: any) => shop?.name || '-',
          },
        ]}
        rowActions={(product) => (
          <button className="text-blue-600 hover:underline">
            Détails
          </button>
        )}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
```

## 3. Créer une page avec filtres et pagination

```typescript
// app/admin/products/page.tsx
'use client'

import { Suspense } from 'react'
import { useListingFilters } from '@/hooks/useListingFilters'
import { getProductsPaginated } from '@/actions/products-paginated'
import { FilterBar } from '@/components/admin/FilterBar'
import { ProductsTable } from '@/components/admin/ProductsTable'
import { SkeletonTable } from '@/components/LoadingFallback'

async function ProductsContent() {
  const filters = useListingFilters()

  const result = await getProductsPaginated({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.sortBy === 'status' ? undefined : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })

  return (
    <ProductsTable
      products={result.data}
      page={filters.page}
      totalPages={result.pagination.pages}
      onPageChange={filters.setPage}
    />
  )
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Modération produits</h1>
      </div>

      <FilterBar
        onSearch={() => {}}
        filters={[
          {
            key: 'status',
            label: 'Statut',
            type: 'select',
            options: [
              { value: 'PENDING_REVIEW', label: 'En attente' },
              { value: 'APPROVED', label: 'Approuvé' },
              { value: 'REJECTED', label: 'Rejeté' },
            ],
          },
        ]}
      />

      <Suspense fallback={<SkeletonTable />}>
        <ProductsContent />
      </Suspense>
    </div>
  )
}
```

## 4. Utiliser les notifications

```typescript
// components/admin/MyActionButton.tsx
'use client'

import { useNotification } from '@/hooks/useNotification'
import { deleteProduct } from '@/actions/products'

export function DeleteButton({ productId }: { productId: string }) {
  const { promise } = useNotification()

  const handleDelete = async () => {
    await promise(
      deleteProduct(productId),
      {
        loading: 'Suppression...',
        success: 'Produit supprimé',
        error: 'Erreur lors de la suppression',
      }
    )
  }

  return <button onClick={handleDelete}>Supprimer</button>
}
```

## 5. Utiliser ConfirmDialog pour actions sensibles

```typescript
// components/admin/ApproveProductButton.tsx
'use client'

import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { approveProduct } from '@/actions/products'

export function ApproveButton({ product }: { product: any }) {
  return (
    <ConfirmDialog
      title="Approuver produit"
      description={`Êtes-vous sûr d'approuver "${product.name}"?`}
      confirmText="Approuver"
      onConfirm={() => approveProduct(product.id)}
    >
      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
        Approuver
      </button>
    </ConfirmDialog>
  )
}
```

## 6. Utiliser StatusBadge avec mappage automatique

```typescript
// Dans une page ou composant
import { StatusBadge, getStatusVariant } from '@/components/admin/StatusBadge'

export function OrderItem({ order }: { order: any }) {
  return (
    <div className="flex justify-between">
      <span>{order.id}</span>
      <StatusBadge
        status={order.status}
        variant={getStatusVariant(order.status)}
      />
    </div>
  )
}

// Automatiquement: DELIVERED = vert, PENDING = orange, CANCELLED = rouge, etc.
```

## 7. Créer une action serveur complète

```typescript
// actions/sellers.ts
'use server'

import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Not admin')
  return user.id
}

export async function approveSeller(
  sellerId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const adminId = await assertAdmin()

    const seller = await prisma.seller.findUnique({ where: { id: sellerId } })
    if (!seller) return { success: false, message: 'Vendeur non trouvé' }

    await prisma.seller.update({
      where: { id: sellerId },
      data: { verification_status: 'APPROVED' },
    })

    await logAdminAction({
      adminId,
      action: 'approve_seller',
      resourceType: 'Seller',
      resourceId: sellerId,
      changes: { status: 'APPROVED' },
    })

    revalidatePath('/admin/vendors')
    return { success: true, message: 'Vendeur approuvé' }
  } catch (error) {
    return { success: false, message: String(error) }
  }
}
```

---

## Points clés

✅ **Validation**: Tout est validé avec Zod  
✅ **Pagination**: Skip/take côté serveur  
✅ **Filtres**: Via query params + hook  
✅ **Notifications**: Toast success/error  
✅ **Export**: CSV/JSON côté client  
✅ **Audit**: Logging de chaque action admin  
✅ **Confirmations**: Dialogs pour destructifs  
✅ **Sécurité**: assertAdmin() sur actions

