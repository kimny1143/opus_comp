import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { PurchaseOrderStatus } from '@prisma/client'

interface Props {
  params: Promise<{ id: string }> | { id: string }
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
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

    if (!purchaseOrder) {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Decimal値を数値に変換
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

    return NextResponse.json(formattedPurchaseOrder)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    const body = await request.json()
    console.log('Received data in API:', body)
    console.log('Status from request:', body.status)

    // データの検証を追加
    if (!body.vendorId || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { status, items, ...data } = body

    // ステータス履歴も更新
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...data,
        status: status as PurchaseOrderStatus || PurchaseOrderStatus.DRAFT,
        updatedAt: new Date(),
        updatedById: session.user.id,
        items: {
          deleteMany: {},
          create: items.map((item: any) => ({
            itemName: item.itemName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            amount: item.amount
          }))
        },
        statusHistory: {
          create: {
            type: 'PURCHASE_ORDER',
            status: status as PurchaseOrderStatus || PurchaseOrderStatus.DRAFT,
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

    return NextResponse.json(updatedPO)
  } catch (error) {
    console.error('Update error:', error)
    return handleApiError(error)
  }
}