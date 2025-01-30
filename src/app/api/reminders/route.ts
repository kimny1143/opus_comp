import { NextResponse } from 'next/server'
import { addDays, subDays } from 'date-fns'
import { InvoiceStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mailService } from '@/lib/mail'

/**
 * リマインダーメールを送信する関数
 */
export async function sendReminder() {
  const today = new Date()
  const sevenDaysLater = addDays(today, 7)
  const threeDaysLater = addDays(today, 3)
  const yesterday = subDays(today, 1)

  // 期限7日前の請求書を取得
  const sevenDaysReminders = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.SENT,
      dueDate: {
        equals: sevenDaysLater
      }
    },
    include: {
      vendor: true
    }
  })

  // 期限3日前の請求書を取得
  const threeDaysReminders = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.SENT,
      dueDate: {
        equals: threeDaysLater
      }
    },
    include: {
      vendor: true
    }
  })

  // 期限超過の請求書を取得
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.SENT,
      dueDate: {
        lte: yesterday
      }
    },
    include: {
      vendor: true
    }
  })

  // リマインダー送信ログを記録する関数
  const logReminder = async (invoiceId: string, type: 'BEFORE_DUE' | 'AFTER_DUE') => {
    await prisma.reminderLog.create({
      data: {
        invoiceId,
        type,
        sentAt: new Date()
      }
    })
  }

  // 7日前のリマインダーを送信
  for (const invoice of sevenDaysReminders) {
    if (invoice.vendor.email) {
      await mailService.sendMail({
        to: invoice.vendor.email,
        subject: '【リマインダー】支払期限が近づいています',
        text: `${invoice.vendor.name} 様\n\n請求書の支払期限が7日後に迫っています。\n支払いの手続きをお願いいたします。`
      })
      await logReminder(invoice.id, 'BEFORE_DUE')
    }
  }

  // 3日前のリマインダーを送信
  for (const invoice of threeDaysReminders) {
    if (invoice.vendor.email) {
      await mailService.sendMail({
        to: invoice.vendor.email,
        subject: '【リマインダー】支払期限が迫っています',
        text: `${invoice.vendor.name} 様\n\n請求書の支払期限が3日後に迫っています。\n至急、支払いの手続きをお願いいたします。`
      })
      await logReminder(invoice.id, 'BEFORE_DUE')
    }
  }

  // 期限超過の請求書を処理
  for (const invoice of overdueInvoices) {
    // ステータスをOVERDUEに更新
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: InvoiceStatus.OVERDUE }
    })

    // ステータス履歴を記録
    await prisma.statusHistory.create({
      data: {
        type: 'INVOICE',
        status: InvoiceStatus.OVERDUE,
        invoiceId: invoice.id,
        userId: 'system',
        comment: '支払期限超過によるステータス自動更新'
      }
    })

    // リマインダーメールを送信
    if (invoice.vendor.email) {
      await mailService.sendMail({
        to: invoice.vendor.email,
        subject: '【重要】支払期限が超過しています',
        text: `${invoice.vendor.name} 様\n\n請求書の支払期限を超過しています。\n至急、支払いの手続きをお願いいたします。`
      })
      await logReminder(invoice.id, 'AFTER_DUE')
    }
  }
}

/**
 * リマインダー処理を実行するAPIエンドポイント
 */
export async function POST() {
  try {
    await sendReminder()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('リマインダー処理でエラーが発生しました:', error)
    return NextResponse.json(
      { error: 'リマインダー処理に失敗しました' },
      { status: 500 }
    )
  }
} 
