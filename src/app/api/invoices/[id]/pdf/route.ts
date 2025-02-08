import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 請求書の取得
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        vendor: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // PDFの生成
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
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
  doc.fontSize(20)
    .text('請求書', { align: 'center' })
    .moveDown()

  // 基本情報
  doc.fontSize(12)
    .text(`請求書番号: ${invoice.id}`)
    .text(`発行日: ${formatDate(invoice.createdAt)}`)
    .moveDown()

  // 取引先情報
  doc.text('請求先:')
    .text(invoice.vendor.name)
    .text(invoice.vendor.email)
    .text(invoice.vendor.address || '')
    .moveDown()

  // 金額
  doc.fontSize(14)
    .text('請求金額:', { continued: true })
    .text(`¥${invoice.totalAmount.toLocaleString()}`, { align: 'right' })
    .moveDown()

  // ステータス
  doc.fontSize(12)
    .text('ステータス:', { continued: true })
    .text(invoice.status === 'APPROVED' ? '承認済み' : '下書き', { align: 'right' })
    .moveDown()

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