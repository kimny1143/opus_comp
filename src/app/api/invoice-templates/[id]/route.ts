import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'

// GET: 特定のテンプレートの取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const template = await prisma.invoiceTemplate.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id  // ユーザー所有のテンプレートのみアクセス可能
      },
      include: {
        items: true,
        _count: {
          select: { invoices: true }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'テンプレートが見つかりません' },
        { status: 404 }
      )
    }

    return createApiResponse(template)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH: テンプレートの更新
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const data = await request.json()
    const { items, ...templateData } = data

    // テンプレートの所有者チェック
    const existingTemplate = await prisma.invoiceTemplate.findUnique({
      where: { id: params.id }
    })

    if (!existingTemplate || existingTemplate.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'テンプレートが見つかりません' },
        { status: 404 }
      )
    }

    // トランザクションでテンプレートを更新
    const template = await prisma.$transaction(async (tx) => {
      const updatedTemplate = await tx.invoiceTemplate.update({
        where: { id: params.id },
        data: {
          ...templateData,
          items: {
            deleteMany: {},  // 既存のアイテムを削除
            create: items    // 新しいアイテムを作成
          }
        },
        include: {
          items: true
        }
      })

      return updatedTemplate
    })

    return createApiResponse(template)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE: テンプレートの削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    // テンプレートの所有者チェック
    const template = await prisma.invoiceTemplate.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { invoices: true }
        }
      }
    })

    if (!template || template.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'テンプレートが見つかりません' },
        { status: 404 }
      )
    }

    // 使用中のテンプレートは削除不可
    if (template._count.invoices > 0) {
      return NextResponse.json(
        { success: false, error: '使用中のテンプレートは削除できません' },
        { status: 400 }
      )
    }

    await prisma.invoiceTemplate.delete({
      where: { id: params.id }
    })

    return createApiResponse({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
} 