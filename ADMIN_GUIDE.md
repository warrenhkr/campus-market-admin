# 📊 Campus Market Admin - Guide Complet

## Vue d'ensemble

Panel d'administration moderne et scalable pour la plateforme **Campus Market**, construit avec Next.js 16, Supabase, Prisma et Tailwind CSS.

### Stack technique
- **Framework:** Next.js 16 (App Router)
- **Auth:** Supabase Auth + RLS
- **Database:** PostgreSQL via Prisma ORM
- **UI:** Tailwind CSS + Shadcn/UI components
- **Notifications:** Sonner toasts
- **Validation:** Zod schemas
- **Export:** CSV/JSON

---

## 🏗️ Architecture

### Structure des répertoires

```
campus-market-admin/
├── app/
│   ├── (auth)/                 # Routes d'authentification (groupe)
│   │   └── login/page.tsx     # Page de connexion
│   ├── admin/                  # Toutes les pages admin
│   │   ├── layout.tsx         # Layout admin avec sidebar
│   │   ├── dashboard/         # Dashboard avec KPIs
│   │   ├── users/             # Gestion utilisateurs
│   │   ├── vendors/           # Gestion vendeurs
│   │   ├── products/          # Modération produits
│   │   ├── orders/            # Gestion commandes
│   │   ├── payments/          # Transactions paiements
│   │   ├── support/           # Tickets support
│   │   └── ...autres modules
│   ├── layout.tsx             # Layout racine
│   ├── page.tsx               # Redirect vers /admin
│   └── globals.css            # Styles globaux
│
├── actions/
│   ├── auth.ts                # Authentification + login/logout
│   ├── users-paginated.ts    # Gestion utilisateurs (NOUVEAU)
│   ├── users.ts              # Gestion utilisateurs (old)
│   ├── products-moderation.ts # Modération produits
│   ├── orders.ts             # Gestion commandes
│   ├── payments.ts           # Gestion paiements
│   ├── ...autres actions
│   └── audit.ts              # Logging des actions admin
│
├── components/
│   ├── ErrorBoundary.tsx      # Error boundary global
│   ├── ToasterProvider.tsx    # Provider Sonner
│   ├── LoadingFallback.tsx    # Skeletons
│   ├── admin/
│   │   ├── DataTable.tsx      # Table réutilisable (pagination, tri)
│   │   ├── EnhancedUsersTable.tsx  # Table utilisateurs avec actions
│   │   ├── FilterBar.tsx      # Filtres (search, select, date)
│   │   ├── ConfirmDialog.tsx  # Dialogs de confirmation
│   │   ├── ExportMenu.tsx     # Menu export (CSV/JSON)
│   │   ├── StatusBadge.tsx    # Badge statuts
│   │   └── ...autres composants
│   └── auth/
│       └── LogoutButton.tsx   # Bouton logout
│
├── hooks/
│   ├── useNotification.ts     # Hook pour toasts
│   └── useListingFilters.ts   # Hook pour filtres + pagination
│
├── lib/
│   ├── validation.ts          # Schemas Zod centralisés
│   ├── pagination.ts          # Helpers pagination (skip, take, pages)
│   ├── filters.ts             # Helpers filtrage (search, date range, etc)
│   ├── errors.ts              # Classes erreurs personnalisées
│   ├── logger.ts              # Logging centralisé
│   ├── export.ts              # Helpers export (CSV/JSON)
│   ├── prisma.ts              # Client Prisma singleton
│   ├── audit.ts               # Audit logging
│   ├── supabase/
│   │   ├── server.ts          # Client Supabase serveur
│   │   ├── client.ts          # Client Supabase client
│   │   └── service.ts         # Service client admin
│   └── email/
│       └── resend.ts          # Intégration Resend
│
├── prisma/
│   ├── schema.prisma          # Schéma database (15 modèles)
│   ├── migrations/            # Migrations database
│   └── seed.ts                # Données initiales
│
└── supabase/
    └── migrations/            # Scripts SQL Supabase
```

---

## 🚀 Démarrage rapide

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Configurer la base de données
npx prisma db push

# Générer le client Prisma
npx prisma generate

# Lancer le serveur de dev
npm run dev
```

Accédez à http://localhost:3000

### Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/campus_market

# Email (optional)
RESEND_API_KEY=xxx
```

---

## 📋 Composants principaux

### DataTable

Composant réutilisable pour lister les données avec pagination, tri et filtrage côté client.

```tsx
import { DataTable, Pagination } from '@/components/admin/DataTable'

interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: Date
}

export function MyTable({ users }: { users: User[] }) {
  return (
    <>
      <DataTable
        data={users}
        columns={[
          { key: 'email', label: 'Email', sortable: true },
          { key: 'name', label: 'Nom', sortable: false },
          {
            key: 'role',
            label: 'Rôle',
            sortable: true,
            render: (role) => <span className="font-bold">{role}</span>
          },
        ]}
        sortBy="created_at"
        sortOrder="desc"
        onSort={(key, order) => console.log(key, order)}
        rowActions={(user) => (
          <button onClick={() => console.log(user.id)}>Edit</button>
        )}
      />
      <Pagination page={1} totalPages={10} onPageChange={(p) => {}} />
    </>
  )
}
```

### FilterBar

Composant pour filtrer (search + selects + date range).

```tsx
import { FilterBar } from '@/components/admin/FilterBar'

export function MyPage() {
  return (
    <FilterBar
      onSearch={(query) => console.log('Search:', query)}
      filters={[
        {
          key: 'status',
          label: 'Statut',
          type: 'select',
          options: [
            { value: 'ACTIVE', label: 'Actif' },
            { value: 'INACTIVE', label: 'Inactif' },
          ],
        },
        {
          key: 'dateFrom',
          label: 'À partir du',
          type: 'date',
        },
      ]}
    />
  )
}
```

### ConfirmDialog

Composant pour les actions destructrices.

```tsx
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

export function MyComponent() {
  return (
    <ConfirmDialog
      title="Supprimer utilisateur"
      description="Êtes-vous sûr?"
      confirmText="Supprimer"
      isDanger={true}
      onConfirm={async () => await deleteUser()}
    >
      <button>Supprimer</button>
    </ConfirmDialog>
  )
}
```

### StatusBadge

Badge pour afficher les statuts avec couleurs automatiques.

```tsx
import { StatusBadge, getStatusVariant } from '@/components/admin/StatusBadge'

export function MyComponent() {
  return (
    <StatusBadge
      status="COMPLETED"
      variant={getStatusVariant('COMPLETED')}
      size="md"
    />
  )
}
```

---

## 🔧 Server Actions

### Schéma pagination

```tsx
// dans les actions serveur
import { getUsersPaginated } from '@/actions/users-paginated'

const result = await getUsersPaginated({
  page: 1,
  limit: 20,
  search: 'john',
  role: 'SELLER',
  sortBy: 'created_at',
  sortOrder: 'desc',
})

// result.data = User[]
// result.pagination = { total, page, limit, pages }
```

### Validation Zod

Tous les schemas sont centralisés dans `lib/validation.ts`:

```tsx
import { userUpdateSchema, productCreateSchema } from '@/lib/validation'

export async function updateUser(userId: string, data: unknown) {
  const validated = userUpdateSchema.parse(data)
  // utiliser validated
}
```

### Logging des actions

```tsx
import { logAdminAction } from '@/lib/audit'

await logAdminAction({
  adminId: 'user-id',
  action: 'delete_product',
  resourceType: 'Product',
  resourceId: 'product-id',
  changes: { name: 'Old Name', status: 'HIDDEN' },
})
```

---

## 🎯 Bonnes pratiques

### ✅ À faire

1. **Utiliser les Server Components** pour les pages (data fetching côté serveur)
2. **Validation Zod** sur chaque action serveur
3. **Revalidation** des pages après modifications (`revalidatePath`)
4. **Toasts** pour tout feedback utilisateur via `useNotification()`
5. **Error Boundaries** wrappent les sections critiques
6. **RLS Supabase** pour la sécurité database
7. **AdminLog** pour tracer chaque action sensible

### ❌ À ne pas faire

1. Ne pas stocker les données sensibles côté client
2. Ne pas faire confiance aux données utilisateur sans validation
3. Ne pas faire de N+1 queries avec Prisma (utiliser `select` + `include`)
4. Ne pas hardcoder les URLs (utiliser `href="/admin/users"`)
5. Ne pas bypasser `assertAdmin()` sur les actions sensibles

---

## 📊 Modules implémentés

### ✅ Complètement implémentés

- **Dashboard**: KPIs, charts, alertes
- **Users**: Liste, filtrage, roles, suspension, suppression
- **Sellers**: Approbation, abonnements
- **Products**: Modération, approbation/rejet
- **Orders**: Liste, détails, statut
- **Payments**: Transactions, refunds
- **Support**: Tickets, assignation, réponses
- **Categories**: CRUD
- **Reviews**: Liste, suppression
- **Alerts**: Système alertes
- **Settings**: Configuration
- **Logs**: Audit trail admin

### 🔄 À améliorer

- [ ] Pagination côté serveur intégrée partout
- [ ] Filtrage avancé avec sauvegarde
- [ ] Export PDF
- [ ] Real-time updates (WebSocket)
- [ ] 2FA pour admins
- [ ] Rate limiting par action
- [ ] Caching Redis
- [ ] Tests automatisés
- [ ] Documentation Swagger

---

## 📝 Exemples d'utilisation

### Page complète avec pagination

```tsx
// app/admin/users/page.tsx
'use client'

import { useListingFilters } from '@/hooks/useListingFilters'
import { getUsersPaginated } from '@/actions/users-paginated'
import { EnhancedUsersTable } from '@/components/admin/EnhancedUsersTable'
import { FilterBar } from '@/components/admin/FilterBar'

export default async function UsersPage() {
  const filters = useListingFilters({ defaultPage: 1, defaultLimit: 20 })

  const result = await getUsersPaginated({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })

  return (
    <div className="space-y-4">
      <FilterBar onSearch={filters.setSearch} />
      <EnhancedUsersTable
        users={result.data}
        page={filters.page}
        totalPages={result.pagination.pages}
        onPageChange={filters.setPage}
        onSort={filters.setSort}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
      />
    </div>
  )
}
```

### Créer une action serveur

```tsx
// actions/my-action.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { mySchema } from '@/lib/validation'
import { logAdminAction } from '@/lib/audit'

async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Not admin')
  return user.id
}

export async function myServerAction(data: unknown) {
  try {
    const adminId = await assertAdmin()
    const validated = mySchema.parse(data)

    const result = await prisma.resource.create({
      data: validated,
    })

    await logAdminAction({
      adminId,
      action: 'create_resource',
      resourceType: 'Resource',
      resourceId: result.id,
      changes: result,
    })

    revalidatePath('/admin/resources')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

---

## 🧪 Tests

```bash
# Build
npm run build

# Vérifier les types
npx tsc --noEmit

# Regénérer Prisma
npx prisma generate

# Migrer la DB
npx prisma db push
```

---

## 📚 Ressources

- [Next.js 16 Docs](https://nextjs.org/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Supabase Docs](https://supabase.com/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod Validation](https://zod.dev/)

---

## 📞 Support

Pour toute question ou problème, vérifiez:
1. Console navigateur (frontend errors)
2. Terminal (server errors)
3. Prisma Studio: `npx prisma studio`
4. Logs admin: `/admin/logs`

