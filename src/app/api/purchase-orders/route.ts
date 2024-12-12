import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma, PurchaseOrderStatus } from '@prisma/client'
import { z } from 'zod'

// バリデーションスキーマ
const purchaseOrderItemSchema = z.object({
  itemName: z.string().min(1, '品目名は必須です'),
  quantity: z.number().positive('数量は0より大きい値を入力してください'),
  unitPrice: z.number().positive('単価は0より大きい値を入力してください'),
  taxRate: z.number().min(0, '税率は0以上の値を入力してください'),
  description: z.string().optional()
})

const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, '取引先IDは必須です'),
  orderDate: z.string().datetime(),
  deliveryDate: z.string().datetime().nullable(),
  description: z.string().nullable(),
  terms: z.string().nullable(),
  status: z.enum(['DRAFT', 'SENT', 'COMPLETED', 'REJECTED']),
  items: z.array(z.object({
    itemName: z.string().min(1, '品目名は必須です'),
    description: z.string().nullable(),
    quantity: z.number().positive('数量は0より大きい値を入力してください'),
    unitPrice: z.number().positive('単価は0より大きい値を入力してください'),
    taxRate: z.number().min(0, '税率は0以上の値を入力してください'),
    amount: z.number().optional()
  })).min(1, '品目は1つ以上必要です')
})

// 発注番号生成関数を追加
function generateOrderNumber(): string {
  return `PO${Date.now()}`
}

// GET: 発注一覧の取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as PurchaseOrderStatus | null
    const vendorId = searchParams.get('vendorId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // 検索条件の構築
    const where: Prisma.PurchaseOrderWhereInput = {
      ...(status && { status: status as PurchaseOrderStatus }),
      ...(vendorId && { vendorId })
    }

    // 発注一覧を取得
    const [orders, total] = await prisma.$transaction([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          items: true,
          statusHistory: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.purchaseOrder.count({ where })
    ])

    // Decimal値を数値に変換
    const purchaseOrders = orders.map(order => ({
      ...order,
      totalAmount: order.totalAmount.toNumber(),
      items: order.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice.toNumber(),
        taxRate: item.taxRate.toNumber()
      }))
    }))

    return createApiResponse({
      purchaseOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST: 発注書の作成
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    console.log('Received data:', data)  // デバッグ用ログ追加
    const validatedData = createPurchaseOrderSchema.parse(data)

    // 税額と合計金額の計算
    const totalAmount = new Prisma.Decimal(
      validatedData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0)
    )

    const taxAmount = new Prisma.Decimal(
      validatedData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice * item.taxRate), 0)
    )

    // POSTハンドラーでのアイテム作成を修正
    const items = validatedData.items.map(item => ({
      ...item,
      amount: new Prisma.Decimal(item.quantity * item.unitPrice)
    }))

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber: generateOrderNumber(),
        vendorId: validatedData.vendorId,
        orderDate: validatedData.orderDate,
        deliveryDate: validatedData.deliveryDate,
        description: validatedData.description,
        terms: validatedData.terms,
        status: PurchaseOrderStatus.DRAFT,
        totalAmount,
        taxAmount,
        createdById: session.user.id,
        items: {
          create: items
        },
        statusHistory: {
          create: {
            status: PurchaseOrderStatus.DRAFT,
            userId: session.user.id
          }
        }
      },
      include: {
        items: true,
        vendor: true,
        statusHistory: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(purchaseOrder)
  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ message: error instanceof Error ? error.message : '予期せぬエラーが発生しました' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 