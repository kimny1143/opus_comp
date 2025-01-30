import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { generateInvoiceHtml } from '@/lib/invoice-generator'
import puppeteer from 'puppeteer'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface BankInfo {
  bankName: string
  branchName: string
  accountType: string
  accountNumber: string
  accountHolder: string
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 請求書データの取得
    const invoice = await prisma.invoice.findUnique({
      where: { id: (await context.params).id },
      include: {
        items: true,
        vendor: true,
        purchaseOrder: true,
        template: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // デフォルトの銀行情報
    const defaultBankInfo: BankInfo = {
      bankName: '',
      branchName: '',
      accountType: '普通',
      accountNumber: '',
      accountHolder: ''
    }

    // 銀行情報の型変換
    const bankInfo = invoice.bankInfo && typeof invoice.bankInfo === 'object' ? {
      bankName: String((invoice.bankInfo as any).bankName || ''),
      branchName: String((invoice.bankInfo as any).branchName || ''),
      accountType: String((invoice.bankInfo as any).accountType || '普通'),
      accountNumber: String((invoice.bankInfo as any).accountNumber || ''),
      accountHolder: String((invoice.bankInfo as any).accountHolder || '')
    } : defaultBankInfo

    // HTMLの生成
    const html = await generateInvoiceHtml({
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      items: invoice.items.map(item => ({
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate)
      })),
      vendor: {
        name: invoice.vendor.name,
        address: invoice.vendor.address || '',
        registrationNumber: invoice.vendor.registrationNumber || ''
      },
      bankInfo
    })

    // PDFの生成
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    await browser.close()

    // PDFのレスポンス
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.id}.pdf"`
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
} 