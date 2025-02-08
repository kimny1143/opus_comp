import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { Prisma, PurchaseOrderStatus } from '@prisma/client'
import { serializeDecimal } from '@/lib/utils/decimal-serializer'
import { validationMessages } from '@/lib/validations/messages'
import {
  purchaseOrderCreateSchema,
  purchaseOrderUpdateSchema,
  purchaseOrderStatusUpdateSchema,
  bulkActionSchema,
  type PurchaseOrderCreateInput
} from './validation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('purchase-orders')

// 許可されているHTTPメソッド
const ALLOWED_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] as const
type AllowedMethod = typeof ALLOWED_METHODS[number]

// 共通のミドルウェア関数
async function withErrorHandler(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const method = req.method as AllowedMethod
    if (!ALLOWED_METHODS.includes(method)) {
      return new NextResponse(
        JSON.stringify({
          error: `Method ${method} Not Allowed`
        }),
        {
          status: 405,
          headers: {
            'Allow': ALLOWED_METHODS.join(', '),
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // 認証チェック(OPTIONSリクエストはスキップ)
    if (method !== 'OPTIONS') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return new NextResponse(
          JSON.stringify({
            error: validationMessages.auth.required
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
    }

    return await handler()
  } catch (error) {
    logger.error('APIエラーが発生しました', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.url
    })
    return handleApiError(error)
  }
}

// 発注書の取得に使用する共通のinclude設定
const purchaseOrderInclude = {
  vendor: {
    select: {
      id: true,
      name: true,
      code: true,
      address: true
    }
  },
  items: {
    select: {
      id: true,
      itemName: true,
      quantity: true,
      unitPrice: true,
      taxRate: true,
      description: true,
      amount: true
    }
  },
  tags: {
    select: {
      id: true,
      name: true
    }
  },
  statusHistory: {
    select: {
      id: true,
      type: true,
      status: true,
      comment: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc' as const
    },
    take: 5 // 最新5件のみ取得
  }
} as const

// OPTIONS: CORS プリフライトリクエスト対応
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

// GET: 発注書一覧の取得
export async function GET(request: NextRequest) {
  return withErrorHandler(request, async () => {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const statusParam = searchParams.get('status')
    const vendorId = searchParams.get('vendorId')
    const searchQuery = searchParams.get('q')

    const status = statusParam as PurchaseOrderStatus | undefined
    const validStatus = status && Object.values(PurchaseOrderStatus).includes(status) ? status : undefined

    const where: Prisma.PurchaseOrderWhereInput = {
      ...(validStatus && { status: validStatus }),
      ...(vendorId && { vendorId }),
      ...(searchQuery && {
        OR: [
          { orderNumber: { contains: searchQuery, mode: 'insensitive' } },
          { vendor: { name: { contains: searchQuery, mode: 'insensitive' } } }
        ]
      })
    }

    // 一度のクエリで必要なデータを全て取得
    const [total, purchaseOrders] = await Promise.all([
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.findMany({
        where,
        include: purchaseOrderInclude,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      })
    ])

    // 日付を適切にフォーマット
    const formattedPurchaseOrders = purchaseOrders.map(order => ({
      ...order,
      orderDate: order.orderDate?.toISOString(),
      deliveryDate: order.deliveryDate?.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      statusHistory: order.statusHistory.map(history => ({
        ...history,
        createdAt: history.createdAt.toISOString()
      }))
    }))

    // レスポンスデータをシリアライズ
    const serializedPurchaseOrders = serializeDecimal(formattedPurchaseOrders)
    
    return NextResponse.json({
      success: true,
      data: {
        purchaseOrders: serializedPurchaseOrders,
        metadata: {
          total,
          page,
          limit
        }
      }
    })
  })
}

// POST: 発注書の新規作成
export async function POST(request: NextRequest) {
  return withErrorHandler(request, async () => {
    const data = await request.json()

    // バリデーション
    const validationResult = purchaseOrderCreateSchema.safeParse(data)
    if (!validationResult.success) {
      logger.warn('バリデーションエラー', {
        errors: validationResult.error.errors
      })
      return NextResponse.json(
        { 
          error: validationMessages.validation.invalid,
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const {
      items,
      tags = [],
      vendorId,
      orderDate,
      deliveryDate,
      status,
      notes,
      orderNumber,
      ...restData
    } = validationResult.data

    // 合計金額の計算
    const totalAmount = items.reduce((sum, item) => {
      const quantity = new Prisma.Decimal(item.quantity)
      const unitPrice = new Prisma.Decimal(item.unitPrice)
      const taxRate = new Prisma.Decimal(item.taxRate)
      const amount = quantity
        .mul(unitPrice)
        .mul(new Prisma.Decimal(1).add(taxRate))
      return sum.add(amount)
    }, new Prisma.Decimal(0))

    // トランザクションを使用して一括で作成
    const purchaseOrder = await prisma.$transaction(async (tx) => {
      // 発注書の作成
      const order = await tx.purchaseOrder.create({
        data: {
          ...restData,
          orderNumber,
          description: notes || null,
          orderDate: new Date(orderDate),
          deliveryDate: new Date(deliveryDate),
          status,
          totalAmount,
          taxAmount: new Prisma.Decimal(0),
          createdBy: {
            connect: { id: session!.user!.id }
          },
          updatedBy: {
            connect: { id: session!.user!.id }
          },
          vendor: {
            connect: { id: vendorId }
          },
          items: {
            create: items.map(item => ({
              itemName: item.itemName,
              quantity: Number(item.quantity),
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              description: item.description || null,
              amount: item.quantity
                .mul(item.unitPrice)
                .mul(new Prisma.Decimal(1).add(item.taxRate))
            }))
          },
          tags: {
            create: tags.map(tag => ({ name: tag.name }))
          },
          statusHistory: {
            create: {
              type: 'PURCHASE_ORDER',
              status,
              user: {
                connect: { id: session!.user!.id }
              }
            }
          }
        },
        include: purchaseOrderInclude
      })

      return order
    })

    logger.info('発注書を作成しました', {
      purchaseOrderId: purchaseOrder.id,
      orderNumber: purchaseOrder.orderNumber
    })

    return NextResponse.json({ 
      success: true, 
      data: serializeDecimal(purchaseOrder)
    })
  })
}

// PATCH: 発注書の更新
export async function PATCH(request: NextRequest) {
  return withErrorHandler(request, async () => {
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'IDが必要です' },
        { status: 400 }
      )
    }

    // バリデーション
    const validationResult = purchaseOrderUpdateSchema.safeParse(updateData)
    if (!validationResult.success) {
      logger.warn('バリデーションエラー', {
        errors: validationResult.error.errors
      })
      return NextResponse.json(
        { 
          error: validationMessages.validation.invalid,
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const {
      items,
      tags,
      vendorId,
      orderDate,
      deliveryDate,
      status,
      notes,
      orderNumber,
      ...restData
    } = validationResult.data as {
      items?: PurchaseOrderCreateInput['items']
      tags?: { name: string }[]
      vendorId?: string
      orderDate?: string
      deliveryDate?: string
      status?: PurchaseOrderStatus
      notes?: string
      orderNumber?: string
    }

    // トランザクションを使用して一括で更新
    const purchaseOrder = await prisma.$transaction(async (tx) => {
      let totalAmount = undefined

      // itemsが指定されている場合は、合計金額を再計算
      if (items) {
        totalAmount = items.reduce((sum, item) => {
          const quantity = new Prisma.Decimal(item.quantity)
          const unitPrice = new Prisma.Decimal(item.unitPrice)
          const taxRate = new Prisma.Decimal(item.taxRate)
          const amount = quantity
            .mul(unitPrice)
            .mul(new Prisma.Decimal(1).add(taxRate))
          return sum.add(amount)
        }, new Prisma.Decimal(0))
      }

      // 発注書の更新
      const order = await tx.purchaseOrder.update({
        where: { id },
        data: {
          ...restData,
          ...(orderNumber && { orderNumber }),
          ...(notes !== undefined && { description: notes || null }),
          ...(orderDate && { orderDate: new Date(orderDate) }),
          ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
          ...(status && { status }),
          ...(totalAmount && { totalAmount }),
          ...(vendorId && {
            vendor: {
              connect: { id: vendorId }
            }
          }),
          updatedBy: {
            connect: { id: session!.user!.id }
          },
          ...(items && {
            items: {
              deleteMany: {},
              create: items.map(item => ({
                itemName: item.itemName,
                quantity: Number(item.quantity),
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                description: item.description || null,
                amount: item.quantity
                  .mul(item.unitPrice)
                  .mul(new Prisma.Decimal(1).add(item.taxRate))
              }))
            }
          }),
          ...(tags && {
            tags: {
              deleteMany: {},
              create: tags.map(tag => ({ name: tag.name }))
            }
          }),
          ...(status && {
            statusHistory: {
              create: {
                type: 'PURCHASE_ORDER',
                status,
                user: {
                  connect: { id: session!.user!.id }
                }
              }
            }
          })
        },
        include: purchaseOrderInclude
      })

      return order
    })

    logger.info('発注書を更新しました', {
      purchaseOrderId: purchaseOrder.id,
      orderNumber: purchaseOrder.orderNumber
    })

    return NextResponse.json({ 
      success: true, 
      data: serializeDecimal(purchaseOrder)
    })
  })
}

// DELETE: 発注書の削除
export async function DELETE(request: NextRequest) {
  return withErrorHandler(request, async () => {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'IDが必要です' },
        { status: 400 }
      )
    }

    // トランザクションを使用して関連データと一括で削除
    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrder.delete({
        where: { id }
      })
    })

    logger.info('発注書を削除しました', { purchaseOrderId: id })

    return NextResponse.json({ 
      success: true,
      message: '発注書が削除されました'
    })
  })
}