import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'
import { InvoiceStatus } from '@prisma/client'
import { BankInfo } from '@/types/invoice'

// 期限切れ請求書のチェック
export async function checkOverdueInvoices() {
  try {
    // 期限切れの請求書を検索
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: {
          lt: new Date()
        }
      },
      include: {
        vendor: true,
        items: true,
        template: true
      }
    })

    for (const invoice of overdueInvoices) {
      // ステータスを更新
      const updatedInvoice = await prisma.$transaction(async (tx) => {
        const updated = await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: InvoiceStatus.OVERDUE,
            updatedById: 'SYSTEM'
          },
          include: {
            vendor: true,
            items: true,
            template: true
          }
        })

        // ステータス履歴を作成
        await tx.statusHistory.create({
          data: {
            invoiceId: invoice.id,
            userId: 'SYSTEM',
            status: String(InvoiceStatus.OVERDUE),
            type: 'INVOICE',
            comment: '支払期限超過による自動更新'
          }
        })

        return updated
      })

      // メール通知
      if (updatedInvoice.vendor.email) {
        await sendEmail(
          updatedInvoice.vendor.email,
          'invoiceStatusUpdated',
          {
            invoice: {
              ...updatedInvoice,
              bankInfo: updatedInvoice.bankInfo as BankInfo,
              template: {
                id: updatedInvoice.template.id,
                bankInfo: updatedInvoice.template.bankInfo as BankInfo,
                contractorName: updatedInvoice.template.contractorName,
                contractorAddress: updatedInvoice.template.contractorAddress,
                registrationNumber: updatedInvoice.template.registrationNumber,
                paymentTerms: updatedInvoice.template.paymentTerms
              }
            },
            oldStatus: InvoiceStatus.PENDING,
            newStatus: InvoiceStatus.OVERDUE
          }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error checking overdue invoices:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check overdue invoices' },
      { status: 500 }
    )
  }
}