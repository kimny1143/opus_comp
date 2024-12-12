import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { z } from 'zod'

// ステータス定義
const PurchaseOrderStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED'
} as const

type PurchaseOrderStatus = typeof PurchaseOrderStatus[keyof typeof PurchaseOrderStatus]

// バリデーションスキーマ
const bulkActionSchema = z.object({
  action: z.enum(['delete', 'updateStatus']),
  purchaseOrderIds: z.array(z.string().uuid()).min(1, '発注書を選択してください'),
  status: z.enum([
    PurchaseOrderStatus.DRAFT,
    PurchaseOrderStatus.SENT,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.REJECTED
  ]).optional()
})

type BulkActionInput = z.infer<typeof bulkActionSchema>

// 一括操作の上限
const BULK_OPERATION_LIMIT = 100

// ステータス遷移のルールを定義
const statusTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  [PurchaseOrderStatus.DRAFT]: [
    PurchaseOrderStatus.SENT,
    PurchaseOrderStatus.REJECTED
  ],
  [PurchaseOrderStatus.SENT]: [
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.REJECTED
  ],
  [PurchaseOrderStatus.COMPLETED]: [
    PurchaseOrderStatus.REJECTED
  ],
  [PurchaseOrderStatus.REJECTED]: []
}

// ステータス遷移のバリデーション関数
function isValidStatusTransition(
  currentStatus: PurchaseOrderStatus,
  newStatus: PurchaseOrderStatus
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
    if (validatedData.purchaseOrderIds.length > BULK_OPERATION_LIMIT) {
      return NextResponse.json(
        { 
          success: false,
          error: `一度に処理できる発注書は${BULK_OPERATION_LIMIT}件までです`
        },
        { status: 400 }
      )
    }

    // 所有権チェック
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        id: { in: validatedData.purchaseOrderIds },
        OR: [
          { createdById: session.user.id },
          { vendorId: { in: await prisma.vendor.findMany({
            where: { createdById: session.user.id },
            select: { id: true }
          }).then(vendors => vendors.map(v => v.id)) }}
        ]
      }
    })

    if (purchaseOrders.length !== validatedData.purchaseOrderIds.length) {
      return NextResponse.json(
        { success: false, error: '操作権限がない発注書が含まれています' },
        { status: 403 }
      )
    }

    switch (validatedData.action) {
      case 'delete':
        // 削除可能なステータスチェック
        const nonDraftOrders = purchaseOrders.filter(
          order => order.status !== PurchaseOrderStatus.DRAFT
        )
        if (nonDraftOrders.length > 0) {
          return NextResponse.json({
            success: false,
            error: '下書き以外の発注書は削除できません',
            purchaseOrderIds: nonDraftOrders.map(order => order.id)
          }, { status: 400 })
        }

        // トランザクションで削除
        await prisma.$transaction([
          prisma.purchaseOrderItem.deleteMany({
            where: { purchaseOrderId: { in: validatedData.purchaseOrderIds } }
          }),
          prisma.purchaseOrder.deleteMany({
            where: { id: { in: validatedData.purchaseOrderIds } }
          })
        ])

        return createApiResponse({
          message: '一括削除が完了しました',
          deletedCount: validatedData.purchaseOrderIds.length
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
          purchaseOrders.map(async (order) => {
            try {
              if (!isValidStatusTransition(order.status as PurchaseOrderStatus, validatedData.status!)) {
                return {
                  id: order.id,
                  success: false,
                  error: `${order.status}から${validatedData.status}への変更はできません`
                }
              }

              await prisma.purchaseOrder.update({
                where: { id: order.id },
                data: {
                  status: validatedData.status,
                  updatedAt: new Date(),
                  updatedById: session.user.id
                }
              })

              return { id: order.id, success: true }
            } catch (error) {
              return {
                id: order.id,
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