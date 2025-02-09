import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handlePrismaError, createSuccessResponse, createErrorResponse } from '@/lib/api-utils'
import { InvoiceStatus } from '@prisma/client'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return createErrorResponse('認証が必要です', 401)
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: (await context.params).id },
      include: {
        items: true,
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!invoice) {
      return createErrorResponse('請求書が見つかりません', 404)
    }

    return createSuccessResponse(invoice)
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return createErrorResponse('認証が必要です', 401)
    }

    const { amount, status } = await request.json()
    const id = (await context.params).id

    // 請求書の存在確認
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!invoice) {
      return createErrorResponse('請求書が見つかりません', 404)
    }

    // 承認済みの請求書は編集不可
    if (invoice.status === 'APPROVED' && amount) {
      return createErrorResponse('承認済みの請求書は編集できません', 400)
    }

    const updateData: any = {}
    if (amount !== undefined) {
      updateData.totalAmount = amount
    }
    if (status !== undefined) {
      updateData.status = status
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return createSuccessResponse(updatedInvoice)
  } catch (error) {
    return handlePrismaError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return createErrorResponse('認証が必要です', 401)
    }

    const id = (await context.params).id

    // 請求書の存在確認
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoice) {
      return createErrorResponse('請求書が見つかりません', 404)
    }

    // 承認済みの請求書は削除不可
    if (invoice.status === 'APPROVED') {
      return createErrorResponse('承認済みの請求書は削除できません', 400)
    }

    await prisma.invoice.delete({
      where: { id }
    })

    return createSuccessResponse({ success: true })
  } catch (error) {
    return handlePrismaError(error)
  }
}