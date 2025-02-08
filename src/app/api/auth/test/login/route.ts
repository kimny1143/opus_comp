import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRedisClient } from '@/lib/redis/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('auth:test')

export async function POST(request: Request) {
  // 開発環境またはテスト環境でのみ有効
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(
      JSON.stringify({ error: 'Not available in production' }),
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, role } = body

    // テストユーザーの取得または作成
    const user = await prisma.user.upsert({
      where: { email },
      update: { role },
      create: {
        email,
        role,
        hashedPassword: 'test-hash' // テスト用なので実際のハッシュは不要
      }
    })

    // Redisのログイン試行回数をリセット
    const redis = await getRedisClient()
    await redis.del(`login-attempts:${email}`)

    logger.info('テストユーザーでログイン', {
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    logger.error('テストログインエラー', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}