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

// GET: 発注書一覧の取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: validationMessages.auth.required },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const statusParam = searchParams.get('status')
    const vendorId = searchParams.get('vendorId')

    const status = statusParam as PurchaseOrderStatus | undefined
    const validStatus = status && Object.values(PurchaseOrderStatus).includes(status) ? status : undefined

    const where: Prisma.PurchaseOrderWhereInput = {
      ...(validStatus && { status: validStatus }),
      ...(vendorId && { vendorId }),
    }

    const [total, purchaseOrders] = await Promise.all([
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          orderDate: true,
          deliveryDate: true,
          status: true,
          totalAmount: true,
          description: true,
          terms: true,
          createdAt: true,
          updatedAt: true,
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
          }
        },
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
      updatedAt: order.updatedAt.toISOString()
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
  } catch (error) {
    return handleApiError(error)
  }
}

// itemsのマッピング関数
const mapItemsForCreate = (items: PurchaseOrderCreateInput['items']) => {
  return items.map(item => {
    const amount = item.quantity * item.unitPrice * (1 + item.taxRate)
    return {
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: new Prisma.Decimal(item.unitPrice),
      taxRate: new Prisma.Decimal(item.taxRate),
      description: item.description || null,
      amount: new Prisma.Decimal(amount)
    }
  })
}

// POST: 発注書の新規作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: validationMessages.auth.required },
        { status: 401 }
      )
    }

    const data = await request.json()

    // バリデーション
    const validationResult = purchaseOrderCreateSchema.safeParse(data)
    if (!validationResult.success) {
      console.error('バリデーションエラー:', validationResult.error)
      return NextResponse.json(
        { 
          error: validationMessages.validation.invalid,
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const {
      items,
      tags = [],
      vendorId,
      orderDate,
      deliveryDate,
      status,
      ...restData
    } = validationResult.data

    // 合計金額の計算
    const totalAmount = items.reduce((sum, item) => {
      const amount = item.quantity * item.unitPrice * (1 + item.taxRate)
      return sum + amount
    }, 0)

    // Prismaのスキーマに合わせてデータを整形
    const createData: Prisma.PurchaseOrderCreateInput = {
      ...restData,
      orderDate: new Date(orderDate),
      deliveryDate: new Date(deliveryDate),
      status,
      totalAmount: new Prisma.Decimal(totalAmount),
      taxAmount: new Prisma.Decimal(0), // デフォルト値を設定
      orderNumber: `PO-${new Date().getTime()}`,
      createdBy: {
        connect: { id: session.user.id }
      },
      updatedBy: {
        connect: { id: session.user.id }
      },
      vendor: {
        connect: { id: vendorId }
      },
      items: {
        create: mapItemsForCreate(items)
      },
      tags: {
        create: tags.map(tag => ({ name: tag.name }))
      }
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: createData,
      include: {
        vendor: true,
        items: true,
        tags: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: serializeDecimal(purchaseOrder)
    })

  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH: 発注書の更新
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: validationMessages.auth.required },
        { status: 401 }
      )
    }

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
      console.error('バリデーションエラー:', validationResult.error)
      return NextResponse.json(
        { 
          error: validationMessages.validation.invalid,
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const {
      items,
      tags,
      vendorId,
      orderDate,
      deliveryDate,
      status,
      ...restData
    } = validationResult.data as {
      items?: PurchaseOrderCreateInput['items']
      tags?: { name: string }[]
      vendorId?: string
      orderDate?: string
      deliveryDate?: string
      status?: PurchaseOrderStatus
    }

    // 更新データの準備
    const updateDataInput: Prisma.PurchaseOrderUpdateInput = {
      ...restData,
      ...(orderDate && { orderDate: new Date(orderDate) }),
      ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
      ...(status && { status: status as PurchaseOrderStatus }),
      ...(vendorId && {
        vendor: {
          connect: { id: vendorId }
        }
      }),
      updatedBy: {
        connect: { id: session.user.id }
      }
    }

    // itemsが指定されている場合は、既存のitemsを削除して新しいものを作成
    if (items) {
      // 合計金額の再計算
      const totalAmount = items.reduce((sum, item) => {
        const amount = item.quantity * item.unitPrice * (1 + item.taxRate)
        return sum + amount
      }, 0)

      updateDataInput.totalAmount = new Prisma.Decimal(totalAmount)
      updateDataInput.items = {
        deleteMany: {},
        create: mapItemsForCreate(items)
      }
    }

    // tagsが指定されている場合は、既存のtagsを削除して新しいものを作成
    if (tags) {
      updateDataInput.tags = {
        deleteMany: {},
        create: tags.map(tag => ({ name: tag.name }))
      }
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: updateDataInput,
      include: {
        vendor: true,
        items: true,
        tags: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: serializeDecimal(purchaseOrder)
    })

  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE: 発注書の削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: validationMessages.auth.required },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'IDが必要です' },
        { status: 400 }
      )
    }

    // 関連するitemsとtagsも削除
    await prisma.purchaseOrder.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: '発注書が削除されました'
    })

  } catch (error) {
    return handleApiError(error)
  }
} 