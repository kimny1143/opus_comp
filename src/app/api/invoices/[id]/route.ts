import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'

// GET: 特定の請求書の取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            items: true
          }
        },
        purchaseOrder: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
            status: true,
            vendor: {
              select: {
                id: true,
                name: true,
                code: true,
                registrationNumber: true,
                address: true,
                contactPerson: true,
                email: true,
                phone: true
              }
            }
          }
        },
        items: true,
        payment: true,
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
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        where: { id: params.id },
        data: {
          ...invoiceData,
          status,
          ...(items && {
            items: {
              deleteMany: {},  // 既存のアイテムを削���
              create: items    // 新しいアイテムを作成
            }
          })
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

      return updatedInvoice
    })

    return createApiResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE: 請求書の削除（ドラフトのみ）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id }
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
      where: { id: params.id }
    })

    return createApiResponse({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
} 