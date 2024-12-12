import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'

// GET: テンプレート一覧の取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    const where: Prisma.InvoiceTemplateWhereInput = {
      userId: session.user.id  // ユーザー固有のテンプレートのみを取得
    }

    const [total, templates] = await Promise.all([
      prisma.invoiceTemplate.count({ where }),
      prisma.invoiceTemplate.findMany({
        where,
        include: {
          items: true,
          _count: {
            select: { invoices: true }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip: (page - 1) * limit,
        take: limit
      })
    ])

    return createApiResponse({
      templates,
      metadata: {
        total,
        page,
        limit
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST: テンプレートの新規作成
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const data = await request.json()
    const { items, ...templateData } = data

    // トランザクションでテンプレートとアイテムを作成
    const template = await prisma.$transaction(async (tx) => {
      const newTemplate = await tx.invoiceTemplate.create({
        data: {
          ...templateData,
          userId: session.user.id,
          items: {
            create: items.map((item: any) => ({
              itemName: item.itemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              description: item.description
            }))
          }
        },
        include: {
          items: true
        }
      })

      return newTemplate
    })

    return createApiResponse(template)
  } catch (error) {
    return handleApiError(error)
  }
} 