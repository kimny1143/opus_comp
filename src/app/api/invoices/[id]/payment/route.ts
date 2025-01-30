import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, InvoiceStatus } from '@prisma/client'
import { IdRouteContext } from '@/app/api/route-types'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'

// @ts-ignore
export async function POST(request: NextRequest, context: IdRouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = (await context.params)
    const data = await request.json()

    // 支払い情報を更新
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        payment: {
          create: {
            amount: new Prisma.Decimal(data.amount),
            method: data.method,
            paymentDate: new Date(data.paymentDate),
            note: data.note,
            createdById: session.user.id
          }
        },
        status: InvoiceStatus.PAID,
        updatedById: session.user.id
      }
    })

    return NextResponse.json({ success: true, data: { invoice: updatedInvoice } })
  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json(
      { success: false, error: '支払い情報の更新に失敗しました' },
      { status: 500 }
    )
  }
} 