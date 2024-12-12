import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { sendEmail } from '@/lib/mail'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 発注データを取得
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        vendor: true,
        items: true
      }
    })

    if (!purchaseOrder) {
      return NextResponse.json(
        { success: false, error: '発注が見つかりません' },
        { status: 404 }
      )
    }

    if (!purchaseOrder.vendor.email) {
      return NextResponse.json(
        { success: false, error: '取引先のメールアドレスが設定され��ません' },
        { status: 400 }
      )
    }

    // メール送信
    await sendEmail(purchaseOrder.vendor.email, 'orderCreated', {
      orderNumber: purchaseOrder.orderNumber,
      vendorName: purchaseOrder.vendor.name,
      items: purchaseOrder.items.map(item => 
        `${item.itemName}: ${item.quantity}個 × ¥${item.unitPrice}`
      ).join('\n'),
      totalAmount: purchaseOrder.totalAmount.toString()
    })

    // ステータスを更新
    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        updatedAt: new Date(),
        updatedById: session.user.id,
        statusHistory: {
          create: {
            status: 'SENT',
            userId: session.user.id,
            comment: '発注書を送信しました'
          }
        }
      }
    })

    return createApiResponse(updatedOrder)
  } catch (error) {
    return handleApiError(error)
  }
} 