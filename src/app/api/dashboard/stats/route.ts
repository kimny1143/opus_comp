import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { InvoiceStatus, PurchaseOrderStatus } from '@prisma/client'

// GET: ダッシュボード統計情報の取得
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    // 請求書の統計
    const invoiceStats = await prisma.invoice.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        totalAmount: true
      }
    })

    // 発注書の統計
    const purchaseOrderStats = await prisma.purchaseOrder.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        totalAmount: true
      }
    })

    // 統計情報をフォーマット
    const stats = {
      invoices: {
        total: invoiceStats.reduce((sum, stat) => sum + stat._count, 0),
        totalAmount: invoiceStats.reduce((sum, stat) => sum + (stat._sum.totalAmount?.toNumber() || 0), 0),
        byStatus: Object.fromEntries(
          invoiceStats.map(stat => [stat.status, stat._count])
        )
      },
      purchaseOrders: {
        total: purchaseOrderStats.reduce((sum, stat) => sum + stat._count, 0),
        totalAmount: purchaseOrderStats.reduce((sum, stat) => sum + (stat._sum.totalAmount?.toNumber() || 0), 0),
        byStatus: Object.fromEntries(
          purchaseOrderStats.map(stat => [stat.status, stat._count])
        )
      }
    }

    return createApiResponse(stats)
  } catch (error) {
    return handleApiError(error)
  }
} 