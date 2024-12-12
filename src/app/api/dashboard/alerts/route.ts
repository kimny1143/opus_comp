import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 期限切れの請求書を確認
    const overdueInvoices = await prisma.invoice.count({
      where: {
        createdById: session.user.id,
        status: 'OVERDUE'
      }
    })

    // 期限が近い支払いを確認
    const upcomingPayments = await prisma.invoice.count({
      where: {
        createdById: session.user.id,
        status: 'SENT',
        dueDate: {
          lte: new Date(new Date().setDate(new Date().getDate() + 7)) // 7日以内
        }
      }
    })

    const alerts = []

    if (overdueInvoices > 0) {
      alerts.push({
        id: 'overdue',
        type: 'error',
        message: `${overdueInvoices}件の期限切れ請求書があります`,
        timestamp: new Date().toISOString()
      })
    }

    if (upcomingPayments > 0) {
      alerts.push({
        id: 'upcoming',
        type: 'warning',
        message: `${upcomingPayments}件の支払期限が近づいています`,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 