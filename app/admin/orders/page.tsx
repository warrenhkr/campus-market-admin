import { getAllOrders } from '@/actions/orders'
import { OrdersTable } from '@/components/admin/OrdersTable'

export default async function OrdersPage() {
  const orders = await getAllOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestion des commandes</h1>
        <p className="text-gray-600">{orders.length} commandes au total</p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  )
}
