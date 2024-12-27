import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { PurchaseOrderStatus } from '@prisma/client'
import { sendEmail } from '@/lib/mail'
import { IdRouteContext } from '@/app/api/route-types'
import { z } from 'zod'

// バリデーションスキーマ
const statusUpdateSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus),
  comment: z.string().optional()
})

// POST: 発注書のステータス更新
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

    // ステータスの型チェック
    if (!Object.values(PurchaseOrderStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: '無効なステータスです' },
        { status: 400 }
      )
    }

    // 現在の発注書を取得
    const currentPO = await prisma.purchaseOrder.findUnique({
      where: { id: context.params.id },
      include: { vendor: true }
    })

    if (!currentPO) {
      return NextResponse.json(
        { success: false, error: '発注書が見つかりません' },
        { status: 404 }
      )
    }

    const oldStatus = currentPO.status

    const purchaseOrder = await prisma.$transaction(async (tx) => {
      // 発注書の更新
      const updatedPO = await tx.purchaseOrder.update({
        where: { id: context.params.id },
        data: { 
          status,
          updatedById: session.user.id
        },
        include: {
          vendor: true
        }
      })

      // ステータス履歴の作成
      await tx.statusHistory.create({
        data: {
          purchaseOrderId: context.params.id,
          userId: session.user.id,
          status,
          comment,
          type: 'PURCHASE_ORDER'
        }
      })

      return updatedPO
    })

    // メール通知
    if (purchaseOrder.vendor.email) {
      await sendEmail(
        purchaseOrder.vendor.email,
        'purchaseOrderStatusUpdated',
        {
          purchaseOrder,
          oldStatus,
          newStatus: status
        }
      )
    }

    return createApiResponse(purchaseOrder)
  } catch (error) {
    return handleApiError(error)
  }
} 