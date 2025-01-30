import { Invoice, PurchaseOrder, Vendor, Prisma } from '@prisma/client'
import PDFDocument from 'pdfkit'
import path from 'path'

type InvoiceWithRelations = {
  id: string
  invoiceNumber: string | null
  issueDate: Date
  dueDate: Date
  totalAmount: Prisma.Decimal
  status: string
  bankInfo?: {
    bankName: string
    branchName: string
    accountType: 'ordinary' | 'current'
    accountNumber: string
    accountHolder: string
  } | null
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
      // PDFドキュメントの作成
      const doc = new PDFDocument({
        size: 'A4',
        autoFirstPage: true,
        margin: 50
      })

      // 日本語フォントの設定
      const fontPath = path.join(process.cwd(), 'public/fonts/NotoSansJP-Regular.ttf')
      doc.registerFont('NotoSansJP', fontPath)
      doc.font('NotoSansJP')
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
        .text(`支払期限: ${new Date(invoice.dueDate).toLocaleDateString('ja-JP')}`)
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
        .text('税率', 350, tableTop)
        .text('税額', 400, tableTop)
        .text('金額', 450, tableTop)
        .moveDown()

      // 明細
      let y = doc.y
      let subtotal = 0
      let taxTotal = 0

      invoice.items.forEach(item => {
        const amount = item.quantity * Number(item.unitPrice)
        const taxRate = Number(item.taxRate)
        const taxAmount = amount * (taxRate / 100)
        
        subtotal += amount
        taxTotal += taxAmount

        doc
          .text(item.itemName, 50, y)
          .text(item.quantity.toString(), 200, y)
          .text(Number(item.unitPrice).toLocaleString(), 300, y)
          .text(`${taxRate}%`, 350, y)
          .text(taxAmount.toLocaleString(), 400, y)
          .text((amount + taxAmount).toLocaleString(), 450, y)
        y += 20
      })

      // 合計金額
      doc
        .moveDown()
        .text(`小計: ¥${subtotal.toLocaleString()}`, { align: 'right' })
        .text(`消費税: ¥${taxTotal.toLocaleString()}`, { align: 'right' })
        .text(`合計金額: ¥${(subtotal + taxTotal).toLocaleString()}`, { align: 'right' })

      // 支払い情報
      doc
        .moveDown(2)
        .fontSize(12)
        .text('お支払い方法')
        .fontSize(10)
        .text(`銀行名: ${invoice.bankInfo?.bankName || ''}`)
        .text(`支店名: ${invoice.bankInfo?.branchName || ''}`)
        .text(`口座種別: ${invoice.bankInfo?.accountType === 'ordinary' ? '普通' : '当座'}`)
        .text(`口座番号: ${invoice.bankInfo?.accountNumber || ''}`)
        .text(`口座名義: ${invoice.bankInfo?.accountHolder || ''}`)
        .moveDown()

      // フッター
      doc
        .moveDown()
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
