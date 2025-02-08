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
    // 既存のテストユーザーを削除
    await prisma.user.deleteMany({
      where: {
        email: process.env.TEST_USER_EMAIL || 'test@example.com'
      }
    })

    // テストユーザーを作成
    await prisma.user.create({
      data: {
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        name: 'Test User',
        hashedPassword,
        role: 'USER'
      }
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