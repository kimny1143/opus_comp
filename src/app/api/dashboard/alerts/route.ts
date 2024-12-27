import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { InvoiceStatus } from '@prisma/client'

// GET: アラート情報の取得
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    // 期限切れの請求書
    const overdueInvoices = await prisma.invoice.count({
      where: {
        status: InvoiceStatus.OVERDUE,
        dueDate: {
          lt: new Date()
        }
      }
    })

    // 未送信の請求書
    const pendingInvoices = await prisma.invoice.count({
      where: {
        status: InvoiceStatus.PENDING
      }
    })

    // アラート情報を返す
    return createApiResponse({
      overdueInvoices,
      pendingInvoices,
      totalAlerts: overdueInvoices + pendingInvoices
    })
  } catch (error) {
    return handleApiError(error)
  }
} 