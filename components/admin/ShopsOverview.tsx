import { getSubscriptionStatus, STATUS_CONFIG } from '@/lib/subscriptions'

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

export function ShopsOverview({ shops }: { shops: Shop[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {shops.map((shop) => {
        const status = getSubscriptionStatus(shop.seller.subscription_expires_at)
        const statusConfig = STATUS_CONFIG[status]

        return (
          <div key={shop.id}
            className="bg-white border border-gray-200 rounded-xl p-4
              hover:border-gray-300 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50
                flex items-center justify-center text-emerald-600 font-semibold">
                {shop.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{shop.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {shop.seller.user.name ?? shop.seller.user.email}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                text-xs font-medium border ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500
              pt-3 border-t border-gray-50">
              <span>{shop._count.products} produit{shop._count.products > 1 ? 's' : ''}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}