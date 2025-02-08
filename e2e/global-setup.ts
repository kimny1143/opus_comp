import { chromium, FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// テスト環境の設定を読み込み
dotenv.config({ path: '.env.test' })

const prisma = new PrismaClient()

async function globalSetup(config: FullConfig) {
  // テストユーザーの作成
  const hashedPassword = await bcrypt.hash(
    process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    10
  )

  try {
    // 既存のテストユーザーに関連するデータを削除
    const testUserEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
    await prisma.$transaction(async (tx) => {
      // テストユーザーを検索
      const user = await tx.user.findUnique({
        where: { email: testUserEmail }
      })

      if (user) {
        // 関連する発注書を削除
        await tx.purchaseOrder.deleteMany({
          where: {
            OR: [
              { createdById: user.id },
              { updatedById: user.id }
            ]
          }
        })

        // セッションを削除
        await tx.session.deleteMany({
          where: { userId: user.id }
        })

        // アカウントを削除
        await tx.account.deleteMany({
          where: { userId: user.id }
        })

        // ユーザーを削除
        await tx.user.delete({
          where: { id: user.id }
        })
      }

      // 新しいテストユーザーを作成
      await tx.user.create({
        data: {
          email: testUserEmail,
          name: 'Test User',
          hashedPassword,
          role: 'USER'
        }
      })
    })

    // テスト用のセッションデータをクリア
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

    console.log('テスト環境のセットアップが完了しました')
  } catch (error) {
    console.error('テスト環境のセットアップに失敗しました:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }

  // ブラウザの状態をクリア
  const browser = await chromium.launch()
  const context = await browser.newContext()
  await context.clearCookies()
  await browser.close()
}

export default globalSetup