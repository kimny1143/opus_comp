import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { PurchaseOrderStatus } from '@prisma/client'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as PurchaseOrderStatus | null
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    const where = {
      ...(status && { status: status as PurchaseOrderStatus }),
    }

    const [total, purchaseOrders] = await Promise.all([
      prisma.purchaseOrder.count({ where }),
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

    return NextResponse.json({
      success: true,
      purchaseOrders,
      metadata: {
        total,
        page,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received request body:', body)

    // データの検証を追加
    if (!body.vendorId || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: { 
            vendorId: !body.vendorId ? 'Required' : undefined,
            items: !body.items ? 'Required' : !Array.isArray(body.items) ? 'Must be an array' : undefined
          }
        },
        { status: 400 }
      )
    }

    const { items, ...data } = body

    // 発注書番号を生成
    const latestPurchaseOrder = await prisma.purchaseOrder.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const sequence = latestPurchaseOrder 
      ? (parseInt(latestPurchaseOrder.orderNumber.slice(-4)) + 1).toString().padStart(4, '0')
      : '0001'
    const orderNumber = `PO${year}${month}${sequence}`

    // 数値型のフィールドをDecimalに変換
    const purchaseOrderData = {
      ...data,
      orderNumber,
      totalAmount: new Prisma.Decimal(data.totalAmount || 0),
      taxAmount: new Prisma.Decimal(data.taxAmount || 0),
      createdById: session.user.id,
      items: {
        create: items.map((item: any) => ({
          itemName: item.itemName || '',
          description: item.description || '',
          quantity: item.quantity || 0,
          unitPrice: new Prisma.Decimal(item.unitPrice || 0),
          taxRate: new Prisma.Decimal(item.taxRate || 0),
          amount: new Prisma.Decimal(item.amount || 0)
        }))
      },
      statusHistory: {
        create: {
          type: 'PURCHASE_ORDER',
          status: data.status || PurchaseOrderStatus.DRAFT,
          userId: session.user.id
        }
      }
    }

    try {
      const purchaseOrder = await prisma.purchaseOrder.create({
        data: purchaseOrderData,
        include: {
          vendor: true,
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
            }
          }
        }
      })

      // レスポンスデータの数値型を変換
      const formattedPurchaseOrder = {
        ...purchaseOrder,
        totalAmount: purchaseOrder.totalAmount.toNumber(),
        taxAmount: purchaseOrder.taxAmount?.toNumber() ?? 0,
        items: purchaseOrder.items.map(item => ({
          ...item,
          unitPrice: item.unitPrice.toNumber(),
          taxRate: item.taxRate.toNumber(),
          amount: item.amount?.toNumber() ?? 0
        }))
      }

      return NextResponse.json({ success: true, data: formattedPurchaseOrder })
    } catch (error) {
      console.error('Purchase order creation error:', {
        message: error instanceof Error ? error.message : '不明なエラー',
        details: error instanceof Error ? error.stack : String(error)
      })
      return handleApiError(error)
    }
  } catch (error) {
    console.error('Request processing error:', {
      message: error instanceof Error ? error.message : '不明なエラー',
      details: error instanceof Error ? error.stack : String(error)
    })
    return handleApiError(error)
  }
} 