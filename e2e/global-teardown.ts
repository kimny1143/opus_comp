import { FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import path from 'path'

const prisma = new PrismaClient()

async function globalTeardown(config: FullConfig) {
  try {
    // テストユーザーと関連データの削除
    const testUserEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
    await prisma.$transaction(async (tx) => {
      // テストユーザーを検索
      const user = await tx.user.findUnique({
        where: { email: testUserEmail }
      })

      if (user) {
        // 関連する請求書を削除
        await tx.invoice.deleteMany({
          where: {
            OR: [
              { createdById: user.id },
              { updatedById: user.id }
            ]
          }
        })

        // 関連する発注書を削除
        await tx.purchaseOrder.deleteMany({
          where: {
            OR: [
              { createdById: user.id },
              { updatedById: user.id }
            ]
          }
        })

        // 関連する取引先を削除
        await tx.vendor.deleteMany({
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
    })

    // Redisのセッションデータをクリア
    const Redis = require('ioredis')
    const redis = new Redis(process.env.REDIS_URL)
    
    const sessionKeys = await redis.keys(`${process.env.REDIS_PREFIX || 'opus_test:'}session:*`)
    if (sessionKeys.length > 0) {
      await redis.del(...sessionKeys)
    }
    
    const userSessionKeys = await redis.keys(`${process.env.REDIS_PREFIX || 'opus_test:'}user-sessions:*`)
    if (userSessionKeys.length > 0) {
      await redis.del(...userSessionKeys)
    }
    
    const loginAttemptKeys = await redis.keys(`${process.env.REDIS_PREFIX || 'opus_test:'}login-attempt:*`)
    if (loginAttemptKeys.length > 0) {
      await redis.del(...loginAttemptKeys)
    }

    await redis.quit()
    console.log('テスト環境のクリーンアップが完了しました')
  } catch (error) {
    console.error('テスト環境のクリーンアップに失敗しました:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export default globalTeardown