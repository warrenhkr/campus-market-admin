import { getAllReviews } from '@/actions/reviews'
import { ReviewsTable } from '@/components/admin/ReviewsTable'

export default async function ReviewsPage() {
  const reviews = await getAllReviews()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestion des avis</h1>
        <p className="text-gray-600">{reviews.length} avis au total</p>
      </div>

      <ReviewsTable reviews={reviews} />
    </div>
  )
}
