import { prisma } from './prisma'

export async function logAdminAction({
  adminId,
  action,
  resourceType,
  resourceId,
  changes = {},
  metadata = {},
}: {
  adminId: string
  action: string
  resourceType: string
  resourceId?: string
  changes?: Record<string, unknown>
  metadata?: Record<string, unknown>
}) {
  try {
    await prisma.adminLog.create({
      data: {
        user_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        changes,
        metadata,
      },
    })
  } catch (err) {
    console.error('Failed to log admin action:', err)
  }
}
