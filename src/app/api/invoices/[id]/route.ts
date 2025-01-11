import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'
import { InvoiceStatus } from '@prisma/client'

interface RouteContext {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: context.params.id },
      include: {
        items: true,
        vendor: true,
        purchaseOrder: true,
        template: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { status } = await request.json()
    if (!status || !Object.values(InvoiceStatus).includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: { status: status as InvoiceStatus }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    await prisma.invoice.delete({
      where: { id: context.params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber: body.invoiceNumber,
        status: body.status,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        notes: body.notes,
        updatedById: session.user.id,
      },
      include: {
        items: true,
        vendor: true,
        purchaseOrder: true,
        template: true,
      },
    })

    // Decimalデータをシリアライズ
    const serializedInvoice = {
      ...updatedInvoice,
      totalAmount: updatedInvoice.totalAmount.toString(),
      items: updatedInvoice.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        taxRate: item.taxRate.toString(),
      })),
      purchaseOrder: updatedInvoice.purchaseOrder ? {
        ...updatedInvoice.purchaseOrder,
        totalAmount: updatedInvoice.purchaseOrder.totalAmount.toString(),
        taxAmount: updatedInvoice.purchaseOrder.taxAmount.toString(),
      } : null,
    }

    return NextResponse.json(serializedInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}