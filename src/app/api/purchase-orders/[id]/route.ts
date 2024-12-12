import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { PurchaseOrderStatus } from '@prisma/client'

interface Props {
  params: { id: string }
}

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
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
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true
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
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = context.params
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
        status: status || PurchaseOrderStatus.DRAFT,
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
        // ステータス履歴を追加
        statusHistory: {
          create: {
            status: status || PurchaseOrderStatus.DRAFT,
            userId: session.user.id,
          }
        }
      },
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
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    console.log('Updated PO:', updatedPO)
    return NextResponse.json(updatedPO)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update purchase order' },
      { status: 500 }
    )
  }
}