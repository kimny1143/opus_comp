import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// ステータス定義
const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
} as const

type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus]

// バリデーションスキーマ
const bulkActionSchema = z.object({
  action: z.enum(['delete', 'updateStatus']),
  invoiceIds: z.array(z.string().uuid()).min(1, '請求書を選択してください'),
  status: z.enum([
    InvoiceStatus.DRAFT,
    InvoiceStatus.SENT,
    InvoiceStatus.PAID,
    InvoiceStatus.OVERDUE,
    InvoiceStatus.CANCELLED
  ]).optional()
})

type BulkActionInput = z.infer<typeof bulkActionSchema>

// 一括操作の上限
const BULK_OPERATION_LIMIT = 100

// ステータス遷移のルールを定義
const statusTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  [InvoiceStatus.DRAFT]: [
    InvoiceStatus.SENT,
    InvoiceStatus.CANCELLED
  ],
  [InvoiceStatus.SENT]: [
    InvoiceStatus.PAID,
    InvoiceStatus.OVERDUE,
    InvoiceStatus.CANCELLED
  ],
  [InvoiceStatus.PAID]: [
    InvoiceStatus.CANCELLED
  ],
  [InvoiceStatus.OVERDUE]: [
    InvoiceStatus.PAID,
    InvoiceStatus.CANCELLED
  ],
  [InvoiceStatus.CANCELLED]: []
}

// ステータス遷移のバリデーション関数
function isValidStatusTransition(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus
): boolean {
  return statusTransitions[currentStatus].includes(newStatus)
}

// POST: 一括操作
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = bulkActionSchema.parse(body)

    // 一括操作の上限チェック
    if (validatedData.invoiceIds.length > BULK_OPERATION_LIMIT) {
      return NextResponse.json(
        { 
          success: false,
          error: `一度に処理できる請求書は${BULK_OPERATION_LIMIT}件までです`
        },
        { status: 400 }
      )
    }

    // 所有権チェック
    const invoices = await prisma.invoice.findMany({
      where: {
        id: { in: validatedData.invoiceIds },
        OR: [
          { createdById: session.user.id },
          { templateId: { in: await prisma.invoiceTemplate.findMany({
            where: { userId: session.user.id },
            select: { id: true }
          }).then(templates => templates.map(t => t.id)) }}
        ]
      }
    })

    if (invoices.length !== validatedData.invoiceIds.length) {
      return NextResponse.json(
        { success: false, error: '操作権限がない請求書が含まれています' },
        { status: 403 }
      )
    }

    switch (validatedData.action) {
      case 'delete':
        // 削除可能なステータスチェック
        const nonDraftInvoices = invoices.filter(inv => inv.status !== InvoiceStatus.DRAFT)
        if (nonDraftInvoices.length > 0) {
          return NextResponse.json({
            success: false,
            error: '下書き以外の請求書は削除できません',
            invoiceIds: nonDraftInvoices.map(inv => inv.id)
          }, { status: 400 })
        }

        // トランザクションで削除
        await prisma.$transaction([
          prisma.invoiceItem.deleteMany({
            where: { invoiceId: { in: validatedData.invoiceIds } }
          }),
          prisma.invoice.deleteMany({
            where: { id: { in: validatedData.invoiceIds } }
          })
        ])

        return createApiResponse({
          message: '一括削除が完了しました',
          deletedCount: validatedData.invoiceIds.length
        })

      case 'updateStatus':
        if (!validatedData.status) {
          return NextResponse.json({
            success: false,
            error: '更新後のステータスが指定されていません'
          }, { status: 400 })
        }

        // ステータス更新をトランザクションで実行
        const results = await Promise.all(
          invoices.map(async (invoice) => {
            try {
              if (!isValidStatusTransition(invoice.status as InvoiceStatus, validatedData.status!)) {
                return {
                  id: invoice.id,
                  success: false,
                  error: `${invoice.status}から${validatedData.status}への変更はできません`
                }
              }

              await prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                  status: validatedData.status,
                  updatedAt: new Date()
                }
              })

              return { id: invoice.id, success: true }
            } catch (error) {
              return {
                id: invoice.id,
                success: false,
                error: '更新処理に失敗しました'
              }
            }
          })
        )

        return createApiResponse({
          message: 'ステータス更新が完了しました',
          results
        })

      default:
        return NextResponse.json(
          { success: false, error: '不正な操作です' },
          { status: 400 }
        )
    }
  } catch (error) {
    return handleApiError(error)
  }
} 