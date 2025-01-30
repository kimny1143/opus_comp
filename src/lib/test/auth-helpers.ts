import { test as base, Page } from '@playwright/test'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

// テストユーザーの型定義
type TestUser = {
  email: string
  password: string
  name: string
}

// カスタムフィクスチャーの型定義
type CustomFixtures = {
  authenticatedPage: Page
}

// デフォルトのテストユーザー
const defaultUser: TestUser = {
  email: 'test@example.com',
  password: 'TestPass123',
  name: 'Test User'
}

// テストユーザーを作成する関数
export async function createTestUser(user: Partial<TestUser> = {}) {
  const testUser = { ...defaultUser, ...user }
  const hashedPassword = await hash(testUser.password, 12)

  return prisma.user.upsert({
    where: { email: testUser.email },
    update: {
      hashedPassword,
      name: testUser.name
    },
    create: {
      email: testUser.email,
      hashedPassword,
      name: testUser.name
    }
  })
}

// テストユーザーでログインする関数
export async function loginAsTestUser(page: Page, user: Partial<TestUser> = {}) {
  const testUser = { ...defaultUser, ...user }

  await page.goto('/auth/signin')
  await page.fill('input[name="email"]', testUser.email)
  await page.fill('input[name="password"]', testUser.password)
  await page.click('button[type="submit"]')

  // ログイン後のリダイレクトを待つ
  await page.waitForURL('/')
}

// カスタムテストフィクスチャーの作成
export const test = base.extend<CustomFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // テストユーザーを作成
    await createTestUser()

    // ログイン
    await loginAsTestUser(page)

    // ページオブジェクトを提供
    await use(page)

    // クリーンアップ（オプション）
    await prisma.user.deleteMany({
      where: { email: defaultUser.email }
    })
  }
}) 
