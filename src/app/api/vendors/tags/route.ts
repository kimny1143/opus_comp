import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'

// GET: タグ一覧の取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { vendors: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return createApiResponse(tags)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST: 新しいタグの作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const { name } = await request.json()
    
    const tag = await prisma.tag.create({
      data: { name }
    })

    return createApiResponse(tag)
  } catch (error) {
    return handleApiError(error)
  }
} 