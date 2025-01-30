import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'

const BUSINESS_TYPE_TAGS = [
  { name: '製造業' },
  { name: '卸売業' },
  { name: '小売業' },
  { name: 'サービス業' },
  { name: 'その他' }
] as const

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // セッション情報をログに出力
    console.log('Session info:', {
      session,
      user: session?.user,
      role: session?.user?.role,
      timestamp: new Date().toISOString()
    })

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    const createdTags = await prisma.$transaction(
      BUSINESS_TYPE_TAGS.map(tag => 
        prisma.tag.upsert({
          where: { name: tag.name },
          update: {},
          create: {
            name: tag.name
          }
        })
      )
    )

    return createApiResponse({
      message: '業種タグを作成しました',
      tags: createdTags
    })
  } catch (error) {
    return handleApiError(error)
  }
} 