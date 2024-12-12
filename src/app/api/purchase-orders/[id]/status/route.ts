import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { sendEmail } from '@/lib/mail'
import { z } from 'zod'

const statusUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'SENT', 'COMPLETED', 'REJECTED', 'OVERDUE']),
  comment: z.string().optional()
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, comment } = statusUpdateSchema.parse(body)

    // トランザクションでステータス更新を行う
    const result = await prisma.$transaction(async (prisma) => {
      // 発注を取得して現在のステータスをチェック
      const currentOrder = await prisma.purchaseOrder.findUnique({
        where: { id: params.id },
        include: {
          vendor: true
        }
      })

      if (!currentOrder) {
        throw new Error('発注が見つかりません')
      }

      // ステータス遷移のバリデーション
      if (!isValidStatusTransition(currentOrder.status, status)) {
        throw new Error(`${currentOrder.status}から${status}への変更は許可されていません`)
      }

      // 発注のステータスを更新
      const updatedOrder = await prisma.purchaseOrder.update({
        where: { id: params.id },
        data: {
          status,
          updatedAt: new Date(),
          updatedById: session.user.id,
          statusHistory: {
            create: {
              status,
              userId: session.user.id,
              comment: comment || `ステータスを${status}に変更しました`
            }
          }
        },
        include: {
          vendor: true,
          items: true,
          statusHistory: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      })

      // メール送信
      if (updatedOrder.vendor.email) {
        await sendEmail(updatedOrder.vendor.email, 'statusUpdated', {
          orderNumber: updatedOrder.orderNumber,
          vendorName: updatedOrder.vendor.name,
          status: getStatusLabel(status)
        })
      }

      return updatedOrder
    })

    return createApiResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

// ステータス遷移のバリデーション
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const statusTransitions: Record<string, string[]> = {
    DRAFT: ['SENT'],
    SENT: ['COMPLETED', 'REJECTED', 'DRAFT', 'PENDING'],
    COMPLETED: ['REJECTED', 'OVERDUE', 'PENDING'],
    REJECTED: ['DRAFT', 'PENDING'],
    OVERDUE: ['PENDING']
  }

  return statusTransitions[currentStatus]?.includes(newStatus) ?? false
}

// ステータスラベルの取得関数
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: '下書き',
    PENDING: '保留中',
    SENT: '送信済み',
    COMPLETED: '承認済み',
    REJECTED: '却下',
    OVERDUE: '期限切れ'
  }
  return statusMap[status] || status
} 