import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { TagFormData } from '@/types/tag'

export const GET = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: context.params.id },
      include: {
        createdBy: {
          select: {
            name: true
          }
        },
        updatedBy: {
          select: {
            name: true
          }
        },
        tags: true
      }
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: '取引先が見つかりません' },
        { status: 404 }
      )
    }

    return createApiResponse({ vendor })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const { id } = context.params
    const data = await request.json()

    // 存在確認
    const existingVendor = await prisma.vendor.findUnique({
      where: { id }
    })

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: '取引先が見つかりません' },
        { status: 404 }
      )
    }

    // トランザクションを使用してタグの更新を確実に行う
    const updatedVendor = await prisma.$transaction(async (tx) => {
      // タグの作成または取得
      const tagPromises = (data.tags as TagFormData[])?.map(async (tag) => {
        return tx.tag.upsert({
          where: { name: tag.name },
          create: { 
            name: tag.name
          },
          update: {}
        })
      }) || []

      const createdTags = await Promise.all(tagPromises)

      // 一旦全てのタグとの関連を削除
      await tx.vendor.update({
        where: { id },
        data: {
          tags: {
            set: []
          }
        }
      })

      // 取引先情報とタグを更新
      return tx.vendor.update({
        where: { id },
        data: {
          name: data.name,
          category: data.category,
          status: data.status,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          address: data.address,
          registrationNumber: data.registrationNumber,
          updatedById: session.user.id,
          updatedAt: new Date(),
          tags: {
            connect: createdTags.map(tag => ({ id: tag.id }))
          }
        },
        include: {
          createdBy: {
            select: {
              name: true
            }
          },
          updatedBy: {
            select: {
              name: true
            }
          },
          tags: true
        }
      })
    })

    return createApiResponse({ vendor: updatedVendor })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const { id } = context.params

    // 存在確認
    const existingVendor = await prisma.vendor.findUnique({
      where: { id }
    })

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: '取引先が見つかりません' },
        { status: 404 }
      )
    }

    await prisma.vendor.delete({
      where: { id }
    })

    return createApiResponse({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
