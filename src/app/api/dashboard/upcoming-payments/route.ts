import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { InvoiceStatus } from '@prisma/client'
import { addDays } from 'date-fns'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: 今後の支払い予定を取得
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const today = new Date()
    const thirtyDaysLater = addDays(today, 30)

    // 支払い予定の請求書を取得
    const upcomingPayments = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.APPROVED,
        dueDate: {
          gte: today,
          lte: thirtyDaysLater
        }
      },
      include: {
        vendor: true,
        items: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    // 支払い予定をフォーマット
    const formattedPayments = upcomingPayments.map(invoice => ({
      id: invoice.id,
      dueDate: invoice.dueDate,
      amount: invoice.totalAmount.toNumber(),
      vendorName: invoice.vendor.name
    }))

    return createApiResponse(formattedPayments)
  } catch (error) {
    return handleApiError(error)
  }
} 