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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const vendorId = searchParams.get('vendorId')
    const search = searchParams.get('search')

    const where = {
      ...(status && { status: status as PurchaseOrderStatus }),
      ...(vendorId && { vendorId }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search } },
          { description: { contains: search } }
        ]
      })
    }

    const [total, purchaseOrders] = await Promise.all([
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      })
    ])

    // Decimal値を数値に変換
    const formattedPurchaseOrders = purchaseOrders.map(po => ({
      ...po,
      totalAmount: po.totalAmount.toNumber(),
      taxAmount: po.taxAmount?.toNumber() ?? 0,
      items: po.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice.toNumber(),
        taxRate: item.taxRate.toNumber(),
        amount: item.amount?.toNumber() ?? 0
      }))
    }))

    return NextResponse.json({
      items: formattedPurchaseOrders,
      total,
      page,
      limit
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received request body:', body)

    // データの検証を追加
    if (!body.vendorId || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Invalid request data', details: { 
          vendorId: !body.vendorId ? 'Required' : undefined,
          items: !body.items ? 'Required' : !Array.isArray(body.items) ? 'Must be an array' : undefined
        }},
        { status: 400 }
      )
    }

    const { items, ...data } = body

    // 数値型のフィールドをDecimalに変換
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        ...data,
        totalAmount: new Prisma.Decimal(data.totalAmount),
        taxAmount: new Prisma.Decimal(data.taxAmount),
        createdById: session.user.id,
        items: {
          create: items.map((item: any) => ({
            itemName: item.itemName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            taxRate: new Prisma.Decimal(item.taxRate),
            amount: new Prisma.Decimal(item.amount)
          }))
        },
        statusHistory: {
          create: {
            type: 'PURCHASE_ORDER',
            status: data.status,
            userId: session.user.id
          }
        }
      },
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
    console.error('Purchase order creation error:', error)
    return handleApiError(error)
  }
} 