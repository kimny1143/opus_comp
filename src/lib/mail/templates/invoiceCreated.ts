import { MailTemplate } from '../types'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/pdf/templates/invoice'
import PDFDocument from 'pdfkit'

export const invoiceCreated: MailTemplate<'invoiceCreated'> = async ({ invoice }) => {
  // Vendorの情報を取得
  const vendor = await prisma.vendor.findUnique({
    where: { id: invoice.vendorId }
  })

  if (!vendor) {
    throw new Error('Vendor not found')
  }

  // 請求書の明細を取得
  const items = await prisma.invoiceItem.findMany({
    where: { invoiceId: invoice.id }
  })

  // 税率区分ごとの集計
  const taxRateSummary = items.reduce((acc, item) => {
    const taxRate = Number(item.taxRate)
    const amount = Number(item.quantity) * Number(item.unitPrice)
    const tax = amount * taxRate

    if (!acc[taxRate]) {
      acc[taxRate] = { amount: 0, tax: 0 }
    }
    acc[taxRate].amount += amount
    acc[taxRate].tax += tax
    return acc
  }, {} as Record<number, { amount: number, tax: number }>)

  // PDFの生成
  const doc = new PDFDocument()
  const chunks: Buffer[] = []
  doc.on('data', chunk => chunks.push(chunk))

  const companyInfo = {
    name: process.env.COMPANY_NAME || '',
    postalCode: process.env.COMPANY_POSTAL_CODE || '',
    address: process.env.COMPANY_ADDRESS || '',
    tel: process.env.COMPANY_TEL || '',
    email: process.env.COMPANY_EMAIL || '',
    registrationNumber: process.env.COMPANY_REGISTRATION_NUMBER || ''
  }

  await generateInvoicePDF(doc, { ...invoice, vendor, items }, companyInfo)
  doc.end()

  const pdfBuffer = Buffer.concat(chunks)

  const subject = `新しい請求書が作成されました - ${invoice.invoiceNumber}`

  const body = `
    ${vendor.name} 様

    新しい請求書が作成されましたのでお知らせいたします。
    ※本メールは適格請求書等に基づく請求書の発行をお知らせするものです。

    請求書番号: ${invoice.invoiceNumber}
    発行日: ${formatDate(invoice.issueDate)}
    支払期限: ${formatDate(invoice.dueDate)}

    ■ 登録番号
    ${vendor.registrationNumber ? `取引先様: ${vendor.registrationNumber}` : ''}
    当社: ${process.env.COMPANY_REGISTRATION_NUMBER}

    ■ 請求金額
    ${Object.entries(taxRateSummary).map(([rate, summary]) => `
    - ${Number(rate) === 0.1 ? '標準税率(10%)' : '軽減税率(8%)'}
      小計: ${formatCurrency(summary.amount)}
      消費税: ${formatCurrency(summary.tax)}
    `).join('\n')}
    合計金額: ${formatCurrency(invoice.totalAmount)}

    請求書の詳細は以下のリンクからご確認いただけます:
    ${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}

    請求書のPDFは添付ファイルをご確認ください。

    ご不明な点がございましたら、お気軽にお問い合わせください。

    よろしくお願いいたします。
  `.trim()

  return {
    subject,
    body,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer
      }
    ]
  }
}