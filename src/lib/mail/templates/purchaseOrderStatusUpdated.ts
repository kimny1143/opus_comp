import { MailTemplate } from '../types'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { PurchaseOrderStatus, PurchaseOrderStatusDisplay } from '@/types/enums'
import { prisma } from '@/lib/prisma'

export function generateStatusUpdateMailSubject(orderNumber: string, newStatus: PurchaseOrderStatus): string {
  return `発注書 ${orderNumber} のステータスが${PurchaseOrderStatusDisplay[newStatus]}に更新されました`
}

export function generateStatusUpdateMailBody(
  orderNumber: string,
  oldStatus: PurchaseOrderStatus,
  newStatus: PurchaseOrderStatus
): string {
  return `
発注書番号：${orderNumber}のステータスが更新されました。

変更前：${PurchaseOrderStatusDisplay[oldStatus]}
変更後：${PurchaseOrderStatusDisplay[newStatus]}

ご確認をお願いいたします。
`
}

export const purchaseOrderStatusUpdated: MailTemplate<'purchaseOrderStatusUpdated'> = async ({ 
  purchaseOrder, 
  oldStatus, 
  newStatus 
}) => {
  // Vendorの情報を取得
  const vendor = await prisma.vendor.findUnique({
    where: { id: purchaseOrder.vendorId }
  })

  if (!vendor) {
    throw new Error('Vendor not found')
  }

  const subject = generateStatusUpdateMailSubject(purchaseOrder.orderNumber, newStatus)

  const body = generateStatusUpdateMailBody(purchaseOrder.orderNumber, oldStatus, newStatus)

  return {
    subject,
    body
  }
} 