import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { createTransport } from 'nodemailer'
import { InvoiceEmail } from '@/emails/InvoiceEmail'
import { Invoice, BankInfo } from '@/types/invoice'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // セッションの確認
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // リクエストボディの取得
    const body = await request.json()
    const { to, cc, subject, body: emailBody } = body

    // 請求書の取得
    const invoiceData = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        vendor: true,
        items: true,
        template: {
          select: {
            id: true,
            bankInfo: true,
            contractorName: true,
            contractorAddress: true,
            registrationNumber: true,
            paymentTerms: true,
          }
        },
      },
    })

    if (!invoiceData || !invoiceData.template) {
      return new NextResponse('Invoice or template not found', { status: 404 })
    }

    // 銀行情報の取得と変換
    let bankInfo: BankInfo
    try {
      bankInfo = JSON.parse(invoiceData.template.bankInfo as string)
    } catch (error) {
      console.error('Error parsing bank info:', error)
      return new NextResponse('Invalid bank information', { status: 400 })
    }

    // 請求書データの変換
    const invoice: Invoice = {
      ...invoiceData,
      bankInfo,
      template: {
        id: invoiceData.template.id,
        bankInfo,
        contractorName: invoiceData.template.contractorName,
        contractorAddress: invoiceData.template.contractorAddress,
        registrationNumber: invoiceData.template.registrationNumber,
        paymentTerms: invoiceData.template.paymentTerms || undefined,
      },
    }

    // メール送信の設定
    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // メールテンプレートのレンダリング
    const emailHtml = await render(InvoiceEmail({ 
      invoice,
      body: emailBody 
    }))

    // メールの送信
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      cc,
      subject,
      html: emailHtml,
      text: emailBody,
    })

    return new NextResponse('Email sent successfully', { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return new NextResponse('Error sending email', { status: 500 })
  }
} 