import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'
import { PurchaseOrderStatus } from '@prisma/client'

// 期限切れ発注書のチェック
export async function checkPurchaseOrders() {
  try {
    // 期限切れの発注書を検索
    const overdueOrders = await prisma.purchaseOrder.findMany({
      where: {
        status: PurchaseOrderStatus.PENDING,
        deliveryDate: {
          lt: new Date()
        }
      },
      include: {
        vendor: true,
        items: true
      }
    })

    for (const order of overdueOrders) {
      // ステータスを更新
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const updated = await tx.purchaseOrder.update({
          where: { id: order.id },
          data: {
            status: PurchaseOrderStatus.COMPLETED,
            updatedById: 'SYSTEM'
          },
          include: {
            vendor: true,
            items: true
          }
        })

        // ステータス履歴を作成
        await tx.statusHistory.create({
          data: {
            purchaseOrderId: order.id,
            userId: 'SYSTEM',
            status: String(PurchaseOrderStatus.COMPLETED),
            type: 'PURCHASE_ORDER',
            comment: '納期超過による自動更新'
          }
        })

        return updated
      })

      // メール通知
      if (updatedOrder.vendor?.email && updatedOrder.vendor?.name) {
        await sendEmail(
          updatedOrder.vendor.email,
          'statusUpdated',
          {
            documentNumber: updatedOrder.orderNumber,
            vendorName: updatedOrder.vendor.name,
            status: PurchaseOrderStatus.COMPLETED
          }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error checking purchase orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check purchase orders' },
      { status: 500 }
    )
  }
} 