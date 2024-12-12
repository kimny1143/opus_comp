import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { VendorStatus, BULK_OPERATION_PARAMS } from '@/types/api'
import { z } from 'zod'
import { Prisma, PurchaseOrder } from '@prisma/client'

// バリデーションスキーマ
const bulkActionSchema = z.object({
  action: z.enum(['delete', 'updateStatus']),
  vendorIds: z.array(z.string().uuid()).min(1, '取引先を選択してください'),
  status: z.enum([
    VendorStatus.ACTIVE,
    VendorStatus.INACTIVE,
    VendorStatus.BLOCKED
  ]).optional()
})

type BulkActionInput = z.infer<typeof bulkActionSchema>

// ステータス遷移のルールを定義
const statusTransitions: Record<VendorStatus, VendorStatus[]> = {
  [VendorStatus.ACTIVE]: [
    VendorStatus.INACTIVE,
    VendorStatus.BLOCKED
  ],
  [VendorStatus.INACTIVE]: [
    VendorStatus.ACTIVE,
    VendorStatus.BLOCKED
  ],
  [VendorStatus.BLOCKED]: [
    VendorStatus.INACTIVE
  ]
}

// ステータス遷移のバリデーション関数
function isValidStatusTransition(
  currentStatus: VendorStatus,
  newStatus: VendorStatus
): boolean {
  return statusTransitions[currentStatus].includes(newStatus)
}

// 型定義を修正
interface PurchaseOrderStatus {
  id: string
  status: string
}

type VendorWithPurchaseOrders = {
  id: string
  status: VendorStatus
  purchaseOrders: PurchaseOrderStatus[]
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
    if (validatedData.vendorIds.length > BULK_OPERATION_PARAMS.BULK_OPERATION_LIMIT) {
      return NextResponse.json(
        { 
          success: false,
          error: `一度に処理できる取引先は${BULK_OPERATION_PARAMS.BULK_OPERATION_LIMIT}件までです`
        },
        { status: 400 }
      )
    }

    // 所有権チェック
    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: validatedData.vendorIds },
        createdById: session.user.id
      },
      include: {
        purchaseOrders: {
          select: {
            id: true,
            status: true
          }
        }
      }
    }) as VendorWithPurchaseOrders[]

    if (vendors.length !== validatedData.vendorIds.length) {
      return NextResponse.json(
        { success: false, error: '操作権限がない取引先が含まれています' },
        { status: 403 }
      )
    }

    switch (validatedData.action) {
      case 'delete':
        // アクティブな取引のある取引先は削除不可
        const activeVendors = vendors.filter(vendor => 
          vendor.purchaseOrders.some((po: PurchaseOrderStatus) => 
            po.status !== 'CANCELLED' && po.status !== 'REJECTED'
          )
        )
        if (activeVendors.length > 0) {
          return NextResponse.json({
            success: false,
            error: 'アクティブな取引がある取引先は削除できません',
            vendorIds: activeVendors.map(v => v.id)
          }, { status: 400 })
        }

        // トランザクションで削除
        await prisma.$transaction([
          prisma.vendor.deleteMany({
            where: { id: { in: validatedData.vendorIds } }
          })
        ])

        return createApiResponse({
          message: '一括削除が完了しました',
          deletedCount: validatedData.vendorIds.length
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
          vendors.map(async (vendor) => {
            try {
              if (!isValidStatusTransition(vendor.status as VendorStatus, validatedData.status!)) {
                return {
                  id: vendor.id,
                  success: false,
                  error: `${vendor.status}から${validatedData.status}への変更はできません`
                }
              }

              await prisma.vendor.update({
                where: { id: vendor.id },
                data: {
                  status: validatedData.status,
                  updatedAt: new Date(),
                  updatedById: session.user.id
                }
              })

              return { id: vendor.id, success: true }
            } catch (error) {
              return {
                id: vendor.id,
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