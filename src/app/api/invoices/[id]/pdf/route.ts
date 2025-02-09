import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'
import { getAuthUser, isAdmin } from '@/utils/auth/session'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 認証済みユーザーの取得
    const authUser = await getAuthUser()

    // 請求書の取得
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        vendor: true,
        items: true,
        createdBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // 作成者または管理者のみアクセス可能
    if (invoice.createdBy.id !== authUser.userId && !isAdmin(authUser)) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      )
    }

    // PDFの生成
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      font: 'public/fonts/NotoSansJP-Regular.ttf'
    })

    // ストリームの設定
    const chunks: Buffer[] = []
    doc.on('data', chunks.push.bind(chunks))
    
    // PDFの内容を生成
    generatePDF(doc, invoice)

    // PDFの生成完了を待つ
    await new Promise<void>((resolve) => {
      doc.on('end', () => resolve())
      doc.end()
    })

    // レスポンスの作成
    const pdfBuffer = Buffer.concat(chunks)
    const response = new NextResponse(pdfBuffer)

    // ヘッダーの設定
    response.headers.set('Content-Type', 'application/pdf')
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.id}.pdf"`
    )

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'PDFの生成に失敗しました' },
      { status: 500 }
    )
  }
}

function generatePDF(doc: PDFKit.PDFDocument, invoice: any) {
  // ヘッダー
  doc.fontSize(24)
    .text('請求書', { align: 'center' })
    .moveDown()

  // 基本情報
  doc.fontSize(12)
    .text(`請求書番号: ${invoice.invoiceNumber}`)
    .text(`発行日: ${formatDate(invoice.issueDate)}`)
    .text(`支払期限: ${formatDate(invoice.dueDate)}`)
    .moveDown()

  // 取引先情報
  doc.text('請求先:')
    .text(invoice.vendor.name)
    .text(invoice.vendor.email)
    .text(invoice.vendor.address || '')
    .moveDown()

  // 請求項目のテーブルヘッダー
  doc.fontSize(12)
    .text('項目', 50, doc.y, { width: 200 })
    .text('数量', 250, doc.y, { width: 50 })
    .text('単価', 300, doc.y, { width: 100 })
    .text('金額', 400, doc.y, { width: 100 })
    .moveDown()

  // 区切り線
  doc.moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown()

  // 請求項目
  let subtotal = 0
  invoice.items.forEach((item: any) => {
    const amount = item.quantity * Number(item.unitPrice)
    subtotal += amount

    doc.text(item.name, 50, doc.y, { width: 200 })
      .text(item.quantity.toString(), 250, doc.y, { width: 50 })
      .text(`¥${Number(item.unitPrice).toLocaleString()}`, 300, doc.y, { width: 100 })
      .text(`¥${amount.toLocaleString()}`, 400, doc.y, { width: 100 })
      .moveDown()

    // 説明がある場合は表示
    if (item.description) {
      doc.fontSize(10)
        .text(item.description, 70, doc.y, { width: 480 })
        .fontSize(12)
        .moveDown()
    }
  })

  // 区切り線
  doc.moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown()

  // 合計金額
  doc.fontSize(14)
    .text('小計:', 300, doc.y, { width: 100 })
    .text(`¥${subtotal.toLocaleString()}`, 400, doc.y, { width: 100 })
    .moveDown()
    .text('消費税(10%):', 300, doc.y, { width: 100 })
    .text(`¥${Math.floor(subtotal * 0.1).toLocaleString()}`, 400, doc.y, { width: 100 })
    .moveDown()
    .text('合計:', 300, doc.y, { width: 100 })
    .text(`¥${invoice.totalAmount.toLocaleString()}`, 400, doc.y, { width: 100 })
    .moveDown(2)

  // ステータス
  doc.fontSize(12)
    .text('ステータス:', { continued: true })
    .text(invoice.status === 'APPROVED' ? '承認済み' : '下書き', { align: 'right' })
    .moveDown(2)

  // フッター
  doc.fontSize(10)
    .text('本請求書はMVPシステムにより自動生成されました。', { align: 'center' })
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}