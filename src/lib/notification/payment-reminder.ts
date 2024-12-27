import { Invoice, InvoiceStatus, Vendor } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail/sendMail'
import { BankInfo } from '@/types/invoice'

type InvoiceWithVendor = Invoice & {
  vendor: Pick<Vendor, 'name' | 'email'>;
  template: {
    bankInfo: BankInfo;
  };
}

// 支払期限が近い請求書のリマインダー送信
export async function sendPaymentDueReminders() {
  const daysBeforeDue = 7 // 支払期限の7日前にリマインダーを送信

  // 支払期限が近い請求書を取得
  const dueInvoices = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.PENDING,
      dueDate: {
        gte: new Date(),
        lte: new Date(Date.now() + daysBeforeDue * 24 * 60 * 60 * 1000)
      }
    },
    include: {
      vendor: {
        select: {
          name: true,
          email: true
        }
      },
      template: {
        select: {
          bankInfo: true
        }
      }
    }
  })

  // リマインダーメールを送信
  for (const invoice of dueInvoices) {
    if (!invoice.vendor.email) continue

    const bankInfo = invoice.template.bankInfo as unknown as BankInfo
    if (!isBankInfo(bankInfo)) {
      console.error(`Invalid bank info for invoice ${invoice.id}`)
      continue
    }

    try {
      await sendMail({
        to: invoice.vendor.email,
        subject: `請求書支払期限のお知らせ（${invoice.invoiceNumber}）`,
        text: `
${invoice.vendor.name} 様

請求書番号：${invoice.invoiceNumber}の支払期限が${daysBeforeDue}日後に迫っています。

支払期限：${invoice.dueDate.toLocaleDateString()}
請求金額：¥${invoice.totalAmount.toNumber().toLocaleString()}

お支払い方法：
${formatBankInfo(bankInfo)}

ご確認をお願いいたします。
`
      })

      // リマインダー送信履歴を記録
      await prisma.reminderLog.create({
        data: {
          invoiceId: invoice.id,
          type: 'PAYMENT_DUE',
          sentAt: new Date()
        }
      })
    } catch (error) {
      console.error(`Failed to send reminder for invoice ${invoice.id}:`, error)
    }
  }
}

// 支払期限切れの請求書のリマインダー送信
export async function sendOverdueReminders() {
  const daysAfterDue = 1 // 支払期限の1日後にリマインダーを送信

  // 支払期限切れの請求書を取得
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.PENDING,
      dueDate: {
        lt: new Date(),
        gte: new Date(Date.now() - daysAfterDue * 24 * 60 * 60 * 1000)
      }
    },
    include: {
      vendor: {
        select: {
          name: true,
          email: true
        }
      },
      template: {
        select: {
          bankInfo: true
        }
      }
    }
  })

  // リマインダーメールを送信
  for (const invoice of overdueInvoices) {
    if (!invoice.vendor.email) continue

    const bankInfo = invoice.template.bankInfo as unknown as BankInfo
    if (!isBankInfo(bankInfo)) {
      console.error(`Invalid bank info for invoice ${invoice.id}`)
      continue
    }

    try {
      await sendMail({
        to: invoice.vendor.email,
        subject: `請求書支払期限超過のお知らせ（${invoice.invoiceNumber}）`,
        text: `
${invoice.vendor.name} 様

請求書番号：${invoice.invoiceNumber}の支払期限が${daysAfterDue}日経過しました。

支払期限：${invoice.dueDate.toLocaleDateString()}
請求金額：¥${invoice.totalAmount.toNumber().toLocaleString()}

お支払い方法：
${formatBankInfo(bankInfo)}

至急のご対応をお願いいたします。
`
      })

      // リマインダー送信履歴を記録
      await prisma.reminderLog.create({
        data: {
          invoiceId: invoice.id,
          type: 'PAYMENT_OVERDUE',
          sentAt: new Date()
        }
      })
    } catch (error) {
      console.error(`Failed to send reminder for invoice ${invoice.id}:`, error)
    }
  }
}

// 銀行情報の型チェック
function isBankInfo(obj: unknown): obj is BankInfo {
  if (typeof obj !== 'object' || obj === null) return false
  const bankInfo = obj as Record<string, unknown>
  return (
    typeof bankInfo.bankName === 'string' &&
    typeof bankInfo.branchName === 'string' &&
    (bankInfo.accountType === 'ordinary' || bankInfo.accountType === 'current') &&
    typeof bankInfo.accountNumber === 'string' &&
    typeof bankInfo.accountHolder === 'string'
  )
}

// 銀行情報のフォーマット
function formatBankInfo(bankInfo: BankInfo): string {
  return `
銀行名：${bankInfo.bankName}
支店名：${bankInfo.branchName}
口座種別：${bankInfo.accountType === 'ordinary' ? '普通' : '当座'}
口座番号：${bankInfo.accountNumber}
口座名義：${bankInfo.accountHolder}
`
} 