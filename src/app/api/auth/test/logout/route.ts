import { NextResponse } from 'next/server'
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
    // Redisのセッションをクリア
    const redis = await getRedisClient()
    const sessionKeys = await redis.keys('session:*')
    if (sessionKeys.length > 0) {
      await redis.del(...sessionKeys)
    }

    // ログイン試行回数もリセット
    const attemptKeys = await redis.keys('login-attempts:*')
    if (attemptKeys.length > 0) {
      await redis.del(...attemptKeys)
    }

    logger.info('テストセッションをクリア')

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('テストログアウトエラー', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}