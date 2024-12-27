import { MailTemplate } from '../types'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { InvoiceStatusDisplay } from '@/types/invoice'
import { prisma } from '@/lib/prisma'

export const invoiceStatusUpdated: MailTemplate<'invoiceStatusUpdated'> = async ({ 
  invoice, 
  oldStatus, 
  newStatus 
}) => {
  // Vendorの情報を取得
  const vendor = await prisma.vendor.findUnique({
    where: { id: invoice.vendorId }
  })

  if (!vendor) {
    throw new Error('Vendor not found')
  }

  const subject = `請求書のステータスが更新されました - ${invoice.invoiceNumber}`

  const body = `
    ${vendor.name} 様

    請求書のステータスが更新されましたのでお知らせいたします。

    請求書番号: ${invoice.invoiceNumber}
    発行日: ${formatDate(invoice.issueDate)}
    支払期限: ${formatDate(invoice.dueDate)}
    金額: ${formatCurrency(invoice.totalAmount)}

    ステータス変更:
    ${InvoiceStatusDisplay[oldStatus]} → ${InvoiceStatusDisplay[newStatus]}

    請求書の詳細は以下のリンクからご確認いただけます：
    ${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}

    ご不明な点がございましたら、お気軽にお問い合わせください。

    よろしくお願いいたします。
  `.trim()

  return {
    subject,
    body
  }
} 