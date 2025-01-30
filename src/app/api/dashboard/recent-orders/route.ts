import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: 最近の注文情報を取得
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const recentOrders = await prisma.purchaseOrder.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        vendor: true
      }
    })

    return createApiResponse(recentOrders)
  } catch (error) {
    return handleApiError(error)
  }
} 