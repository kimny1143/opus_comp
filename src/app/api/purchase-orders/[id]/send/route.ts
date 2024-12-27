import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { PurchaseOrderStatus } from '@prisma/client'
import { sendMail } from '@/lib/mail/sendMail'

interface Props {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 発注書を取得
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        vendor: true,
        items: true,
        statusHistory: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!purchaseOrder.vendor.email) {
      return NextResponse.json({ error: 'Vendor email is not set' }, { status: 400 })
    }

    // メール送信
    await sendMail({
      to: purchaseOrder.vendor.email,
      subject: `発注書 ${purchaseOrder.orderNumber} のお知らせ`,
      text: `
発注書番号: ${purchaseOrder.orderNumber}
取引先: ${purchaseOrder.vendor.name}
合計金額: ¥${purchaseOrder.totalAmount.toNumber().toLocaleString()}

商品明細:
${purchaseOrder.items.map(item => 
  `・${item.itemName}: ${item.quantity}個 × ¥${item.unitPrice.toNumber().toLocaleString()} = ¥${(item.amount?.toNumber() ?? 0).toLocaleString()}`
).join('\n')}

ご確認をお願いいたします。
`
    })

    // ステータスを更新
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        status: PurchaseOrderStatus.SENT,
        updatedAt: new Date(),
        updatedById: session.user.id,
        statusHistory: {
          create: {
            type: 'PURCHASE_ORDER',
            status: PurchaseOrderStatus.SENT,
            userId: session.user.id,
            comment: '発注書を送信しました'
          }
        }
      },
      include: {
        vendor: true,
        items: true,
        statusHistory: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return NextResponse.json(updatedPO)
  } catch (error) {
    return handleApiError(error)
  }
} 