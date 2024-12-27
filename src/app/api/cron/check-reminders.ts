import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus, ReminderType } from '@prisma/client'
import { addDays, differenceInDays } from 'date-fns'
import { EmailNotificationService } from '@/lib/notification/email-service'
import { BankInfo } from '@/types/invoice'

// リマインダーのチェックと送信
export async function checkReminders() {
  try {
    const today = new Date()

    // アクティブな請求書のリマインダー設定を取得
    const reminders = await prisma.reminderSetting.findMany({
      where: {
        enabled: true,
        invoice: {
          status: {
            notIn: [
              InvoiceStatus.PAID,
              InvoiceStatus.REJECTED,
              InvoiceStatus.DRAFT
            ]
          }
        }
      },
      include: {
        invoice: {
          include: {
            vendor: true,
            items: true,
            template: true
          }
        }
      }
    })

    for (const reminder of reminders) {
      const { invoice } = reminder
      if (!invoice) continue

      let shouldSendReminder = false
      let daysOverdue = 0

      switch (reminder.type) {
        case ReminderType.BEFORE_DUE:
          const daysUntilDue = differenceInDays(invoice.dueDate, today)
          shouldSendReminder = daysUntilDue === reminder.daysBeforeOrAfter
          break

        case ReminderType.AFTER_DUE:
          daysOverdue = differenceInDays(today, invoice.dueDate)
          shouldSendReminder = daysOverdue === reminder.daysBeforeOrAfter
          break

        case ReminderType.AFTER_ISSUE:
          const daysAfterIssue = differenceInDays(today, invoice.issueDate)
          shouldSendReminder = daysAfterIssue === reminder.daysBeforeOrAfter
          break
      }

      if (shouldSendReminder && invoice.vendor.email) {
        const emailInvoice = {
          ...invoice,
          bankInfo: invoice.bankInfo as BankInfo,
          template: {
            ...invoice.template,
            bankInfo: invoice.template.bankInfo as BankInfo
          },
          vendor: {
            ...invoice.vendor,
            email: invoice.vendor.email
          }
        }

        // メール送信
        await EmailNotificationService.sendPaymentReminder(
          emailInvoice,
          daysOverdue > 0 ? 'overdue' : 'upcoming'
        )

        // 送信履歴の更新
        await prisma.reminderSetting.update({
          where: { id: reminder.id },
          data: { lastSentAt: today }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error checking reminders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check reminders' },
      { status: 500 }
    )
  }
} 