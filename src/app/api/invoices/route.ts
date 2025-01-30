import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { Prisma, InvoiceStatus } from '@prisma/client'
import { serializeDecimal } from '@/lib/utils/decimal-serializer'
import { validationMessages } from '@/lib/validations/messages'
import { invoiceCreateSchema, type InvoiceCreateInput } from './validation'

// GET: 請求書一覧の取得
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
    const purchaseOrderId = searchParams.get('purchaseOrderId')

    const status = statusParam as InvoiceStatus | undefined
    const validStatus = status && Object.values(InvoiceStatus).includes(status) ? status : undefined

    const where: Prisma.InvoiceWhereInput = {
      ...(validStatus && { status: validStatus }),
      ...(purchaseOrderId && { purchaseOrderId }),
    }

    // 完了済みの発注書で、まだ請求書が作成されていないものを取得
    const completedPurchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        status: 'COMPLETED',
        invoices: {
          none: {}
        }
      },
      include: {
        vendor: true,
        items: true
      }
    })

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        select: {
          id: true,
          invoiceNumber: true,
          issueDate: true,
          dueDate: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          updatedAt: true,
          vendor: {
            select: {
              id: true,
              name: true,
              code: true,
              registrationNumber: true
            }
          },
          items: {
            select: {
              id: true,
              itemName: true,
              quantity: true,
              unitPrice: true,
              taxRate: true,
              description: true
            }
          },
          purchaseOrder: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              vendor: {
                select: {
                  id: true,
                  name: true,
                  address: true
                }
              }
            }
          },
          template: {
            select: {
              id: true,
              bankInfo: true,
              contractorName: true,
              contractorAddress: true,
              registrationNumber: true,
              paymentTerms: true
            }
          },
          bankInfo: true,
          notes: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      })
    ])

    // 日付を適切にフォーマット
    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      issueDate: invoice.issueDate?.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }))

    // レスポンスデータをシリアライズ
    const serializedInvoices = serializeDecimal(formattedInvoices)
    
    return NextResponse.json({
      success: true,
      data: {
        invoices: serializedInvoices,
        completedPurchaseOrders: serializeDecimal(completedPurchaseOrders),
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

// POST: 請求書の新規作成
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
    const validationResult = invoiceCreateSchema.safeParse(data)
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
      bankInfo,
      vendorId,
      purchaseOrderId,
      issueDate,
      dueDate,
      status,
      ...restData
    } = validationResult.data

    // 合計金額の計算
    const totalAmount = items.reduce((sum, item) => {
      const amount = item.quantity * item.unitPrice * (1 + item.taxRate)
      return sum + amount
    }, 0)

    // Prismaのスキーマに合わせてデータを整形
    const createData: Prisma.InvoiceCreateInput = {
      ...restData,
      issueDate,
      dueDate,
      status,
      bankInfo: bankInfo as Prisma.JsonValue,
      totalAmount: new Prisma.Decimal(totalAmount),
      invoiceNumber: `INV-${new Date().getTime()}`,
      createdBy: {
        connect: { id: session.user.id }
      },
      updatedBy: {
        connect: { id: session.user.id }
      },
      vendor: {
        connect: { id: vendorId }
      },
      purchaseOrder: {
        connect: { id: purchaseOrderId }
      },
      items: {
        create: items.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          taxRate: new Prisma.Decimal(item.taxRate),
          description: item.description || null
        }))
      },
      tags: {
        create: tags.map(tag => ({ name: tag.name }))
      }
    }

    const invoice = await prisma.invoice.create({
      data: createData,
      include: {
        vendor: true,
        items: true,
        tags: true,
        purchaseOrder: {
          include: {
            vendor: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: serializeDecimal(invoice)
    })

  } catch (error) {
    return handleApiError(error)
  }
}
