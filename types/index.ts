export interface AdminUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: 'USER' | 'SELLER' | 'ADMIN'
  created_at: Date
}

export interface ListingState {
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  filters: Record<string, any>
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface ApiResponse<T> {
  data: T
  pagination?: PaginationMeta
  message?: string
}

export interface ApiError {
  error: {
    message: string
    code: string
    statusCode: number
  }
}

// Status mappings
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-800' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  SHIPPED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
}

export const ROLES = ['USER', 'SELLER', 'ADMIN'] as const
export const ORDER_STATUSES = ['PENDING', 'COMPLETED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
export const PAYMENT_STATUSES = ['PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'] as const
export const PRODUCT_STATUSES = ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'HIDDEN'] as const
export const SELLER_VERIFICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const
