import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { generateInvoiceHtml } from '@/lib/invoice-generator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'データが提供されていません' },
        { status: 400 }
      )
    }

    // 請求書データの整形
    const invoiceData = {
      ...data,
      items: data.items.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate)
      }))
    }

    // HTMLの生成
    const html = await generateInvoiceHtml(invoiceData)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
} 