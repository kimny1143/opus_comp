import { FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function globalTeardown(config: FullConfig) {
  try {
    // テストユーザーの削除
    await prisma.user.deleteMany({
      where: {
        email: process.env.TEST_USER_EMAIL || 'test@example.com'
      }
    })

    // テストで作成された関連データの削除
    await prisma.$transaction([
      prisma.session.deleteMany({}),
      prisma.account.deleteMany({
        where: {
          user: {
            email: process.env.TEST_USER_EMAIL || 'test@example.com'
          }
        }
      })
    ])

    // Redisのセッションデータをクリア
    const redis = await (await import('@/lib/redis/client')).getRedisClient()
    const sessionKeys = await redis.keys('session:*')
    if (sessionKeys.length > 0) {
      await redis.del(...sessionKeys)
    }
    const userSessionKeys = await redis.keys('user-sessions:*')
    if (userSessionKeys.length > 0) {
      await redis.del(...userSessionKeys)
    }
    const loginAttemptKeys = await redis.keys('login-attempt:*')
    if (loginAttemptKeys.length > 0) {
      await redis.del(...loginAttemptKeys)
    }

    console.log('テスト環境のクリーンアップが完了しました')
  } catch (error) {
    console.error('テスト環境のクリーンアップに失敗しました:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export default globalTeardown