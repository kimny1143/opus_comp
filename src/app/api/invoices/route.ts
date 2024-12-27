import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma, InvoiceStatus } from '@prisma/client'

// GET: 請求書一覧の取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const statusParam = searchParams.get('status')
    const purchaseOrderId = searchParams.get('purchaseOrderId')

    // statusParam を InvoiceStatus 型にキャスト
    const status = statusParam as InvoiceStatus | undefined;
    const validStatus = status && Object.values(InvoiceStatus).includes(status) ? status : undefined;

    const where: Prisma.InvoiceWhereInput = {
      ...(status && { status }),
      ...(purchaseOrderId && { purchaseOrderId })
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: {
          template: {
            include: {
              templateItems: true
            }
          },
          purchaseOrder: {
            include: {
              vendor: true
            }
          },
          items: true,
          vendor: true,
          statusHistory: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
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

    return createApiResponse({
      invoices,
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

// POST: 請求書の新規作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const data = await request.json()
    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        items: {
          create: data.items
        }
      },
      include: {
        template: {
          include: {
            templateItems: true
          }
        },
        purchaseOrder: {
          include: {
            vendor: true
          }
        },
        items: true,
        vendor: true,
        statusHistory: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
    return NextResponse.json(invoice)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
} 