import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { InvoiceStatus } from '@prisma/client'
import { sendEmail } from '@/lib/mail'
import { IdRouteContext } from '@/app/api/route-types'
import { z } from 'zod'
import { BankInfo } from '@/types/invoice'

// バリデーションスキーマ
const statusUpdateSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
  comment: z.string().optional()
})

// POST: 請求書のステータス更新
export const POST = async (
  request: NextRequest,
  context: IdRouteContext
): Promise<NextResponse> => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const data = await request.json()
    const { status, comment } = statusUpdateSchema.parse(data)

    // 現在の請求書を取得
    const currentInvoice = await prisma.invoice.findUnique({
      where: { id: context.params.id },
      include: { 
        vendor: true,
        template: true
      }
    })

    if (!currentInvoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    const oldStatus = currentInvoice.status

    const invoice = await prisma.$transaction(async (tx) => {
      // 請求書の更新
      const updatedInvoice = await tx.invoice.update({
        where: { id: context.params.id },
        data: { 
          status,
          updatedById: session.user.id
        },
        include: {
          vendor: true,
          items: true,
          purchaseOrder: true,
          template: true
        }
      })

      // ステータス履歴の作成
      await tx.statusHistory.create({
        data: {
          invoiceId: context.params.id,
          userId: session.user.id,
          status,
          comment,
          type: 'INVOICE'
        }
      })

      return updatedInvoice
    })

    // メール通知
    if (invoice.vendor.email) {
      await sendEmail(
        invoice.vendor.email,
        'invoiceStatusUpdated',
        {
          invoice: {
            ...invoice,
            bankInfo: invoice.bankInfo as BankInfo,
            template: {
              id: invoice.template.id,
              bankInfo: invoice.template.bankInfo as BankInfo,
              contractorName: invoice.template.contractorName,
              contractorAddress: invoice.template.contractorAddress,
              registrationNumber: invoice.template.registrationNumber,
              paymentTerms: invoice.template.paymentTerms
            }
          },
          oldStatus,
          newStatus: status
        }
      )
    }

    return createApiResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
} 