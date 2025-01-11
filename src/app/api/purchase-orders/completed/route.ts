import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { serializeDecimal } from '@/lib/utils/decimal-serializer'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const completedOrders = await prisma.purchaseOrder.findMany({
      where: {
        status: 'COMPLETED',
        // 請求書が未作成の発注のみを取得
        NOT: {
          invoices: {
            some: {}
          }
        }
      },
      include: {
        vendor: true,
        items: true
      },
      orderBy: {
        orderDate: 'desc'
      }
    })

    const serializedOrders = serializeDecimal(completedOrders)
    return NextResponse.json(serializedOrders)
  } catch (error) {
    console.error('Error fetching completed purchase orders:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 