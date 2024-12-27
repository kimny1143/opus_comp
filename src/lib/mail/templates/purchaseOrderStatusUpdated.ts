import { MailTemplate } from '../types'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { PurchaseOrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// ステータスの表示名マッピング
const statusDisplayNames: Record<PurchaseOrderStatus, string> = {
  DRAFT: '下書き',
  PENDING: '保留中',
  SENT: '送信済み',
  COMPLETED: '納品完了',
  REJECTED: '却下',
  OVERDUE: '期限超過'
}

export function generateStatusUpdateMailSubject(orderNumber: string, newStatus: PurchaseOrderStatus): string {
  return `発注書 ${orderNumber} のステータスが${statusDisplayNames[newStatus]}に更新されました`
}

export function generateStatusUpdateMailBody(
  orderNumber: string,
  oldStatus: PurchaseOrderStatus,
  newStatus: PurchaseOrderStatus
): string {
  return `
発注書番号：${orderNumber}のステータスが更新されました。

変更前：${statusDisplayNames[oldStatus]}
変更後：${statusDisplayNames[newStatus]}

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