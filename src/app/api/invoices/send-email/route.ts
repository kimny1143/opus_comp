import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/pdf'
import { sendEmail } from '@/lib/mail'
import { handleApiError } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { invoiceId, email } = await request.json()

    // 請求書データの取得
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: true,
        items: {
          select: {
            itemName: true,
            quantity: true,
            unitPrice: true,
            taxRate: true,
            description: true
          }
        },
        purchaseOrder: {
          include: {
            vendor: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // bankInfoをパースして型を合わせる
    const bankInfo = typeof invoice.bankInfo === 'string' 
      ? JSON.parse(invoice.bankInfo)
      : invoice.bankInfo

    const invoiceWithParsedBankInfo = {
      ...invoice,
      bankInfo
    }

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // PDFの生成
    const pdfBuffer = await generateInvoicePDF(invoiceWithParsedBankInfo)

    // メール送信
    await sendEmail({
      to: email,
      subject: `請求書 ${invoice.invoiceNumber}`,
      text: `${invoice.vendor.name}様\n\n請求書を添付いたします。\n\n請求金額: ${invoice.totalAmount.toString()}円\n支払期限: ${new Date(invoice.dueDate).toLocaleDateString('ja-JP')}`,
      attachments: [
        {
          filename: `invoice_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer
        }
      ]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
