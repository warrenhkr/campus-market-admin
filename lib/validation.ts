import { z } from 'zod'

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type Pagination = z.infer<typeof paginationSchema>

// Filter schemas
export const filterSchema = z.object({
  search: z.string().max(255).optional(),
  status: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type Filter = z.infer<typeof filterSchema>

// User schemas
export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['USER', 'SELLER', 'ADMIN']),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['USER', 'SELLER', 'ADMIN']).optional(),
})

// Product schemas
export const productCreateSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().uuid().optional(),
})

export const productUpdateSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'HIDDEN']).optional(),
})

// Order schemas
export const orderUpdateStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'SHIPPED', 'DELIVERED']),
})

// Payment schemas
export const paymentRefundSchema = z.object({
  reason: z.string().min(10).max(500),
})

// Seller schemas
export const sellerVerificationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().min(10).max(500).optional(),
})

export const sellerSubscriptionSchema = z.object({
  days: z.coerce.number().int().min(1).max(365),
})

// Report schemas
export const reportResolveSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
  resolution: z.string().min(10).max(1000).optional(),
})

// Support ticket schemas
export const supportTicketReplySchema = z.object({
  message: z.string().min(5).max(2000),
  isInternal: z.boolean().default(false),
})

export const supportTicketUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
})

// Category schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
})

export const categoryUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
})

// Settings schema
export const settingUpdateSchema = z.object({
  value: z.string().max(1000),
})

// File upload schema
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine((file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type), 'Invalid file type'),
})
