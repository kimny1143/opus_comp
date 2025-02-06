import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { addDays } from 'date-fns'
import { ViewUpcomingPayment } from '@/types/view/payment'
import { DbUpcomingPayment } from '@/types/db/payment'
import {
  toViewUpcomingPayments,
  createSuccessResponse,
  createUnauthorizedResponse,
  createInternalErrorResponse
} from '@/utils/typeConverters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET: 今後の支払い予定を取得
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        createUnauthorizedResponse(),
        { status: 401 }
      )
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

    // DBモデルをViewモデルに変換
    const dbPayments: DbUpcomingPayment[] = upcomingPayments.map(invoice => ({
      id: invoice.id,
      dueDate: invoice.dueDate,
      amount: invoice.totalAmount,
      vendorName: invoice.vendor.name
    }))

    // Viewモデルにフォーマットしてレスポンスを返す
    const viewPayments: ViewUpcomingPayment[] = toViewUpcomingPayments(dbPayments)
    return NextResponse.json(createSuccessResponse(viewPayments))
  } catch (error) {
    console.error('Error in GET /api/dashboard/upcoming-payments:', error)
    return NextResponse.json(
      createInternalErrorResponse(
        process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : String(error)
          : undefined
      ),
      { status: 500 }
    )
  }
}