import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'

export type EntityType = 'vendor' | 'invoice' | 'purchaseOrder'

type TagUpdateData = {
  invoices?: {
    connect?: { id: string }
    disconnect?: { id: string }
  }
  purchaseOrders?: {
    connect?: { id: string }
    disconnect?: { id: string }
  }
}

interface TaggingRequest {
  entityType: EntityType
  entityId: string
}

// エンティティの存在確認
async function checkEntityExists(entityType: TaggingRequest['entityType'], entityId: string) {
  switch (entityType) {
    case 'vendor':
      return prisma.vendor.findUnique({ where: { id: entityId } })
    case 'invoice':
      return prisma.invoice.findUnique({ where: { id: entityId } })
    case 'purchaseOrder':
      return prisma.purchaseOrder.findUnique({ where: { id: entityId } })
    default:
      return null
  }
}

// タグの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = params

    const tag = await prisma.tag.delete({
      where: { id }
    })

    return createApiResponse({
      message: 'タグを削除しました',
      tag
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// タグの関連付け
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { entityId, entityType } = await request.json()
    
    if (!entityId || !entityType || !['vendor', 'invoice', 'purchaseOrder'].includes(entityType)) {
      return NextResponse.json(
        { success: false, error: '無効なリクエストです' },
        { status: 400 }
      )
    }

    const tagId = params.id

    // タグと対象エンティティの存在確認
    const [tag, entity] = await Promise.all([
      prisma.tag.findUnique({ where: { id: tagId } }),
      checkEntityExists(entityType, entityId)
    ])

    if (!tag || !entity) {
      return NextResponse.json(
        { success: false, error: 'タグまたは対象エンティティが見つかりません' },
        { status: 404 }
      )
    }

    // タグの関連付けを更新
    const updateData = {
      [entityType + 's']: {
        connect: { id: entityId }
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: updateData,
      include: {
        vendors: true,
        invoices: true,
        purchaseOrders: true
      }
    })

    return NextResponse.json({ success: true, tag: updatedTag })
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { success: false, error: 'タグの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// タグの関連付け解除
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { targetType, targetId } = body

    if (!targetType || !targetId) {
      return NextResponse.json(
        { success: false, error: '関連解除先の情報が不足しています' },
        { status: 400 }
      )
    }

    let updateData: TagUpdateData = {}

    switch (targetType) {
      case 'invoice':
        updateData = {
          invoices: {
            disconnect: { id: targetId }
          }
        }
        break
      case 'purchaseOrder':
        updateData = {
          purchaseOrders: {
            disconnect: { id: targetId }
          }
        }
        break
      default:
        return NextResponse.json(
          { success: false, error: '無効な関連解除先タイプです' },
          { status: 400 }
        )
    }

    const result = await prisma.tag.update({
      where: { id },
      data: updateData as Prisma.TagUpdateInput
    })

    return createApiResponse({
      message: 'タグの関連付けを解除しました',
      tag: result
    })
  } catch (error) {
    return handleApiError(error)
  }
} 