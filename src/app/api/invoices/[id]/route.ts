import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { RouteHandler, IdRouteContext, IdParams } from '../../route-types'

// GET: 特定の請求書の取得
export const GET: RouteHandler<IdParams> = async (
  request: NextRequest,
  context: IdRouteContext
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: context.params.id },
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

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    return createApiResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH: 請求書の更新
export const PATCH: RouteHandler<IdParams> = async (
  request: NextRequest,
  context: IdRouteContext
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const data = await request.json()
    const { items, status, ...invoiceData } = data

    // トランザクションで請求書を更新
    const invoice = await prisma.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: { id: context.params.id },
        data: {
          ...invoiceData,
          status,
          ...(items && {
            items: {
              deleteMany: {},
              create: items
            }
          })
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
          items: true
        }
      })

      return updatedInvoice
    })

    return createApiResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE: 請求書の削除
export const DELETE: RouteHandler<IdParams> = async (
  request: NextRequest,
  context: IdRouteContext
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: context.params.id }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    if (invoice.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'ドラフト状態の請求書のみ削除できます' },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({
      where: { id: context.params.id }
    })

    return createApiResponse({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
} 