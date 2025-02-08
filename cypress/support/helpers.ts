import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * テストデータをセットアップします
       * @example cy.setupTestData()
       */
      setupTestData(): Chainable<void>
      /**
       * テストデータをクリーンアップします
       * @example cy.cleanupTestData()
       */
      cleanupTestData(): Chainable<void>
    }
  }
}

// テスト用のPrismaクライアント
const prisma = new PrismaClient({
  log: ['error']
})

// テスト用のパスワードハッシュ化(簡略化版)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function setupTestDatabase() {
  try {
    // テストユーザーの作成
    const hashedPassword = hashPassword('TestPassword123!')
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'test@example.com',
        hashedPassword,
        role: 'ADMIN'
      }
    })

    // ベンダーユーザーの作成
    const vendorHashedPassword = hashPassword('VendorPass123!')
    await prisma.user.upsert({
      where: { email: 'vendor@example.com' },
      update: {
        hashedPassword: vendorHashedPassword,
        role: 'VENDOR'
      },
      create: {
        email: 'vendor@example.com',
        hashedPassword: vendorHashedPassword,
        role: 'VENDOR'
      }
    })

    console.log('テストデータベースのセットアップが完了しました')
    return null
  } catch (error) {
    console.error('テストデータベースのセットアップに失敗:', error)
    throw error
  }
}

export async function cleanupTestDatabase() {
  try {
    // テストデータのクリーンアップ
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'vendor@example.com']
        }
      }
    })
    console.log('テストデータベースのクリーンアップが完了しました')
    return null
  } catch (error) {
    console.error('テストデータベースのクリーンアップに失敗:', error)
    throw error
  }
}

export function getMockOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    name: 'テスト商品',
    quantity: 1,
    unitPrice: 1000,
    taxRate: 0.10,
    ...overrides
  }
}

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
  taxRate: number
}