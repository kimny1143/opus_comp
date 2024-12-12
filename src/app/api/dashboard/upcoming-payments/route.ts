import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface InvoiceItem {
  quantity: number
  unitPrice: Prisma.Decimal
  taxRate: Prisma.Decimal
}

interface Payment {
  id: string
  dueDate: Date
  items: InvoiceItem[]
  vendor: {
    name: string
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const upcomingPayments = await prisma.invoice.findMany({
      where: {
        createdById: session.user.id,
        status: {
          not: 'PAID'
        },
        dueDate: {
          gte: new Date(),
          lte: new Date(new Date().setDate(new Date().getDate() + 30))
        }
      },
      select: {
        id: true,
        dueDate: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            taxRate: true
          }
        },
        vendor: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 5
    })

    const formattedPayments = upcomingPayments.map((payment: Payment) => ({
      id: payment.id,
      dueDate: payment.dueDate,
      amount: payment.items.reduce((total: number, item: InvoiceItem) => {
        const itemTotal = item.quantity * Number(item.unitPrice)
        const tax = itemTotal * (Number(item.taxRate) / 100)
        return total + itemTotal + tax
      }, 0),
      vendorName: payment.vendor.name
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 