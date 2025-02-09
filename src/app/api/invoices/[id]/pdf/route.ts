import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, isAdmin } from '@/utils/auth/session'
import { createErrorResponse } from '@/lib/api-utils'
import puppeteer from 'puppeteer'
import { generateInvoiceHTML } from './template'

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
        vendor: {
          select: {
            name: true,
            email: true,
            address: true
          }
        },
        items: {
          select: {
            name: true,
            description: true,
            quantity: true,
            unitPrice: true,
            taxRate: true
          }
        },
        createdBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!invoice) {
      return createErrorResponse('請求書が見つかりません', 404)
    }

    // 作成者または管理者のみアクセス可能
    if (invoice.createdBy.id !== authUser.userId && !isAdmin(authUser)) {
      return createErrorResponse('アクセス権限がありません', 403)
    }

    // デバッグ用に請求書データを出力
    console.log('請求書データ:', JSON.stringify(invoice, null, 2))

    // HTMLの生成
    const html = generateInvoiceHTML(invoice)

    // デバッグ用にHTMLを出力
    console.log('生成されたHTML:', html)

    // Puppeteerの起動
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    })

    try {
      // 新しいページを開く
      const page = await browser.newPage()

      // HTMLコンテンツを設定
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      })

      // PDFの生成
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true
      })

      // レスポンスの作成
      const response = new NextResponse(pdf)

      // ヘッダーの設定
      response.headers.set('Content-Type', 'application/pdf')
      response.headers.set(
        'Content-Disposition',
        `attachment; filename="invoice-${invoice.invoiceNumber || invoice.id}.pdf"`
      )

      return response
    } finally {
      // ブラウザを必ず閉じる
      await browser.close()
    }
  } catch (error) {
    console.error('PDF生成エラー:', error)
    return createErrorResponse('PDFの生成に失敗しました', 500)
  }
}