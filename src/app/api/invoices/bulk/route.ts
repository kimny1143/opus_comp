import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-utils'
import { InvoiceStatus } from '@prisma/client'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invoiceIds, status } = body

    if (!Array.isArray(invoiceIds) || !status) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // 一括更新
    const updatedInvoices = await prisma.$transaction(
      invoiceIds.map((id) =>
        prisma.invoice.update({
          where: { id },
          data: {
            status: status as InvoiceStatus,
            updatedAt: new Date(),
            updatedById: session.user.id,
            statusHistory: {
              create: {
                type: 'INVOICE',
                status: status as InvoiceStatus,
                userId: session.user.id
              }
            }
          }
        })
      )
    )

    return NextResponse.json(updatedInvoices)
  } catch (error) {
    return handleApiError(error)
  }
} 