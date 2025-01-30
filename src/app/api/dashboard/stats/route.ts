import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { InvoiceStatus, PurchaseOrderStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: ダッシュボードの統計情報を取得
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    // 統計情報を取得
    const stats = await prisma.$transaction([
      prisma.invoice.count(),
      prisma.purchaseOrder.count(),
      prisma.vendor.count()
    ])

    return createApiResponse({
      totalInvoices: stats[0],
      totalOrders: stats[1],
      totalVendors: stats[2]
    })
  } catch (error) {
    return handleApiError(error)
  }
} 