import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { TagCreateInput } from '@/types/tag'

// タグ一覧の取得
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json({ success: true, tags })
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    return NextResponse.json(
      { success: false, error: 'タグの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// タグの作成
export async function POST(request: NextRequest) {
  try {
    const data: TagCreateInput = await request.json()

    const tag = await prisma.tag.create({
      data: {
        name: data.name
      }
    })

    return NextResponse.json({ success: true, tag })
  } catch (error) {
    console.error('Failed to create tag:', error)
    return NextResponse.json(
      { success: false, error: 'タグの作成に失敗しました' },
      { status: 500 }
    )
  }
}

// タグの削除
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    await prisma.tag.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tag:', error)
    return NextResponse.json(
      { success: false, error: 'タグの削除に失敗しました' },
      { status: 500 }
    )
  }
} 