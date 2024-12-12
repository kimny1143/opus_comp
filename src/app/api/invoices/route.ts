import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma, InvoiceStatus } from '@prisma/client'

// GET: 請求書一覧の取得
export async function GET(request: Request) {
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
            select: {
              id: true,
              name: true
            }
          },
          purchaseOrder: {
            select: {
              id: true,
              orderNumber: true,
              vendor: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  registrationNumber: true
                }
              }
            }
          },
          items: true
        },
        orderBy: {
          updatedAt: 'desc'
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
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const data = await request.json();
    const { items, templateId, purchaseOrderId, issueDate, dueDate } = data;

    // issueDate と dueDate の存在確認
    if (!issueDate || !dueDate) {
      return NextResponse.json(
        { success: false, error: '発行日と支払期日は必須です' },
        { status: 400 }
      );
    }

    // 発注データの取得
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        vendor: true
      }
    })

    if (!purchaseOrder) {
      return NextResponse.json(
        { success: false, error: '対象の発注が見つかりません' },
        { status: 404 }
      )
    }

    // vendorId を取得
    const vendorId = purchaseOrder.vendorId

    // トランザクションで請求書を作成
    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          templateId,
          purchaseOrderId,
          vendorId,
          createdById: session.user.id,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          items: {
            create: items
          }
        },
        include: {
          template: {
            select: {
              id: true,
              name: true
            }
          },
          purchaseOrder: {
            select: {
              id: true,
              orderNumber: true,
              vendor: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  registrationNumber: true
                }
              }
            }
          },
          items: true
        }
      })

      return newInvoice
    })

    return createApiResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
} 