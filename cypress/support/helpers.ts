import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * テストデータのセットアップ用ヘルパー関数
 * MVPの要件に合わせてシンプル化
 */
export async function setupTestVendor() {
  const vendor = await prisma.vendor.create({
    data: {
      name: 'テスト株式会社',
      email: 'test-vendor@example.com',
      phone: '03-1234-5678',
      address: '東京都千代田区...',
      firstTag: '重要',
      secondTag: '取引先',
      createdBy: {
        connect: { id: 'test-user-id' }
      }
    }
  })
  return vendor
}

/**
 * テストデータのクリーンアップ用ヘルパー関数
 */
export async function cleanupTestData() {
  await prisma.invoice.deleteMany({})
  await prisma.vendor.deleteMany({})
  await prisma.user.deleteMany({})
}

/**
 * テストユーザーのセットアップ用ヘルパー関数
 */
export async function setupTestUser() {
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      hashedPassword: 'test-hash',
      role: 'ADMIN'
    }
  })
  return user
}

/**
 * テスト用請求書の作成ヘルパー関数
 */
export async function setupTestInvoice(vendorId: string, userId: string) {
  const invoice = await prisma.invoice.create({
    data: {
      vendorId,
      totalAmount: 10000,
      status: 'DRAFT',
      createdById: userId
    }
  })
  return invoice
}