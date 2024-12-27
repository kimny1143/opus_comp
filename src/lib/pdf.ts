import { Invoice, PurchaseOrder, Vendor, Prisma } from '@prisma/client'
import PDFDocument from 'pdfkit'

type InvoiceWithRelations = {
  id: string
  purchaseOrder?: {
    id: string
    orderNumber: string
    status: string
    vendorId: string
    vendor?: {
      name: string
      address: string | null
    }
  } | null
  items: {
    id?: string
    itemName: string
    quantity: number
    unitPrice: Prisma.Decimal
    taxRate: Prisma.Decimal
    description: string | null
    amount?: Prisma.Decimal
  }[]
}

export async function generateInvoicePDF(invoice: InvoiceWithRelations): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument()
      const chunks: Buffer[] = []

      // PDFドキュメントにデータを書き込む
      doc.on('data', (chunk) => chunks.push(chunk))
      
      // PDFの生成が完了したらBufferを返す
      doc.on('end', () => resolve(Buffer.concat(chunks)))

      // ヘッダー
      doc
        .fontSize(20)
        .text('請求書', { align: 'center' })
        .moveDown()

      // 基本情報
      doc
        .fontSize(12)
        .text(`請求書番号: ${invoice.id}`)
        .text(`発行日: ${new Date().toLocaleDateString('ja-JP')}`)
        .moveDown()

      // 取引先情報
      doc
        .text('請求先:')
        .text(invoice.purchaseOrder?.vendor?.name || '取引先名なし')
        .text(invoice.purchaseOrder?.vendor?.address || '住所なし')
        .moveDown()

      // 明細表のヘッダー
      const tableTop = doc.y
      doc
        .text('品目', 50, tableTop)
        .text('数量', 200, tableTop)
        .text('単価', 300, tableTop)
        .text('金額', 400, tableTop)
        .moveDown()

      // 明細
      let y = doc.y
      invoice.items.forEach(item => {
        const amount = item.quantity * Number(item.unitPrice)
        doc
          .text(item.itemName, 50, y)
          .text(item.quantity.toString(), 200, y)
          .text(Number(item.unitPrice).toLocaleString(), 300, y)
          .text(amount.toLocaleString(), 400, y)
        y += 20
      })

      // 合計金額
      const total = invoice.items.reduce(
        (sum, item) => sum + item.quantity * Number(item.unitPrice),
        0
      )
      doc
        .moveDown()
        .text(`合計金額: ¥${total.toLocaleString()}`, { align: 'right' })

      // フッター
      doc
        .moveDown(2)
        .fontSize(10)
        .text(process.env.COMPANY_NAME || '')
        .text(process.env.COMPANY_ADDRESS || '')
        .text(`登録番号: ${process.env.COMPANY_REGISTRATION_NUMBER || ''}`)

      // PDFの生成を終了
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
} 