import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { generateInvoiceNumber } from '@/utils/invoice/generateInvoiceNumber'
import { createErrorResponse } from '@/lib/api-utils'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('認証が必要です', 401)
    }

    const data = await req.json()
    const { vendorId, amount, taxIncluded = true } = data

    if (!vendorId || !amount) {
      return createErrorResponse('必須項目が不足しています', 400)
    }

    // 取引先の存在確認
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    })

    if (!vendor) {
      return createErrorResponse('取引先が見つかりません', 404)
    }

    // 請求書番号の生成
    const invoiceNumber = await generateInvoiceNumber()

    // 請求書の作成
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        vendorId,
        totalAmount: amount,
        taxIncluded,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        createdById: session.user.id
      },
      include: {
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('請求書作成エラー:', error)
    return createErrorResponse('請求書の作成に失敗しました', 500)
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('認証が必要です', 401)
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        createdById: session.user.id
      },
      include: {
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('請求書一覧取得エラー:', error)
    return createErrorResponse('請求書一覧の取得に失敗しました', 500)
  }
}
