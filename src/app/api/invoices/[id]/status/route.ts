import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { InvoiceStatus, PaymentMethod } from '@prisma/client'
import { z } from 'zod'

const paymentDataSchema = z.object({
  paymentDate: z.string(),
  amount: z.number(),
  method: z.nativeEnum(PaymentMethod),
  note: z.string().optional(),
})

const statusUpdateSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
  comment: z.string().optional(),
  paymentData: paymentDataSchema.optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, comment, paymentData } = statusUpdateSchema.parse(body)

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
        updatedById: session.user.id,
        ...(status === InvoiceStatus.PAID && paymentData
          ? {
              payment: {
                create: {
                  paymentDate: new Date(paymentData.paymentDate),
                  amount: paymentData.amount,
                  method: paymentData.method,
                  note: paymentData.note,
                  createdById: session.user.id,
                },
              },
            }
          : {}),
      },
      include: {
        payment: true,
      },
    });

    return createApiResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
} 