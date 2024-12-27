import { MailTemplate } from '../types'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { prisma } from '@/lib/prisma'

export const purchaseOrderCreated: MailTemplate<'purchaseOrderCreated'> = async ({ purchaseOrder }) => {
  // Vendorの情報を取得
  const vendor = await prisma.vendor.findUnique({
    where: { id: purchaseOrder.vendorId }
  })

  if (!vendor) {
    throw new Error('Vendor not found')
  }

  const subject = `新しい発注書が作成されました - ${purchaseOrder.orderNumber}`

  const body = `
    ${vendor.name} 様

    新しい発注書が作成されましたのでお知らせいたします。

    発注番号: ${purchaseOrder.orderNumber}
    発注日: ${formatDate(purchaseOrder.orderDate)}
    納期: ${purchaseOrder.deliveryDate ? formatDate(purchaseOrder.deliveryDate) : '未定'}
    合計金額: ${formatCurrency(purchaseOrder.totalAmount)}

    発注書の詳細は以下のリンクからご確認いただけます：
    ${process.env.NEXT_PUBLIC_APP_URL}/purchase-orders/${purchaseOrder.id}

    ご不明な点がございましたら、お気軽にお問い合わせください。

    よろしくお願いいたします。
  `.trim()

  return {
    subject,
    body
  }
} 