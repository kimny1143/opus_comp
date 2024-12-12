import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma, PrismaClient } from '@prisma/client'
import { z } from 'zod'

const paymentSchema = z.object({
  paymentDate: z.string().transform(str => new Date(str)),
  amount: z.number().positive('支払い金額は0より大きい値を入力してください'),
  method: z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'OTHER']),
  note: z.string().optional()
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
    const { paymentDate, amount, method, note } = paymentSchema.parse(body)

    // トランザクションで支払い情報を登録
    const result = await prisma.$transaction(async (prisma) => {
      // まず支払い情報を作成
      const payment = await prisma.payment.create({
        data: {
          paymentDate,
          amount: new Prisma.Decimal(amount),
          method,
          note,
          createdById: session.user.id,
          invoiceId: params.id
        }
      })

      // 次に請求書のステータスを更新
      const invoice = await prisma.invoice.update({
        where: { id: params.id },
        data: {
          status: 'PAID',
          updatedAt: new Date(),
          updatedById: session.user.id
        },
        include: {
          items: true,
          purchaseOrder: {
            include: {
              vendor: true
            }
          }
        }
      })

      return { ...invoice, payment }
    })

    return createApiResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
} 