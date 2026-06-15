'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/audit'

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string }

async function assertAdmin(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié.')
  const { data } = await supabase.rpc('is_admin')
  if (!data) throw new Error('Accès refusé.')
  return user.id
}

export async function getAllReports(filters?: { status?: string; search?: string }) {
  await assertAdmin()

  return prisma.report.findMany({
    where: {
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.search && {
        OR: [
          { reason: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      reporter: { select: { id: true, email: true, name: true } },
      product: { select: { id: true, name: true } },
      seller: { select: { id: true, shop_name: true } },
      admin: { select: { id: true, email: true } },
    },
    orderBy: { created_at: 'desc' },
  })
}

export async function getReportDetail(reportId: string) {
  await assertAdmin()
  return prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: true,
      product: true,
      seller: true,
      admin: true,
    },
  })
}

export async function dismissReport(reportId: string): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) return { success: false, error: 'Signalement non trouvé.' }

    await prisma.report.update({
      where: { id: reportId },
      data: { status: 'DISMISSED', resolved_by: adminId, resolved_at: new Date() },
    })

    await logAdminAction({
      adminId,
      action: 'dismiss_report',
      resourceType: 'Report',
      resourceId: reportId,
      metadata: { reason: report.reason },
    })

    revalidatePath('/admin/reports')
    return { success: true, message: 'Signalement archivé.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function resolveReport(
  reportId: string,
  action: 'DELETE_CONTENT' | 'BAN_USER' | 'WARNING'
): Promise<ActionResult> {
  try {
    const adminId = await assertAdmin()

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { product: true, seller: true },
    })
    if (!report) return { success: false, error: 'Signalement non trouvé.' }

    // Take action based on type
    if (action === 'DELETE_CONTENT' && report.product_id) {
      await prisma.product.delete({ where: { id: report.product_id } })
    } else if (action === 'BAN_USER' && report.seller_id) {
      // Soft ban via AdminLog metadata
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolved_by: adminId,
        resolved_at: new Date(),
        resolution: action,
      },
    })

    await logAdminAction({
      adminId,
      action: 'resolve_report',
      resourceType: 'Report',
      resourceId: reportId,
      metadata: { action, product_id: report.product_id, seller_id: report.seller_id },
    })

    revalidatePath('/admin/reports')
    return { success: true, message: `Signalement résolu (${action}).` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
