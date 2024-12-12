import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { PurchaseOrderStatus } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const stats = await prisma.purchaseOrder.groupBy({
      by: ['status'],
      _count: {
        _all: true
      },
      where: {
        createdById: session.user.id
      }
    })

    console.log('Raw stats:', stats)

    const summary = {
      draft: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      issues: 0
    }

    stats.forEach(stat => {
      switch (stat.status) {
        case PurchaseOrderStatus.DRAFT:
          summary.draft = stat._count._all
          break
        case PurchaseOrderStatus.PENDING:
          summary.pending = stat._count._all
          break
        case PurchaseOrderStatus.SENT:
          summary.inProgress = stat._count._all
          break
        case PurchaseOrderStatus.COMPLETED:
          summary.completed = stat._count._all
          break
        case PurchaseOrderStatus.REJECTED:
        case PurchaseOrderStatus.OVERDUE:
          summary.issues += stat._count._all
          break
      }
    })

    console.log('Calculated summary:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 