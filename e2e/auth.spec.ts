import { test, expect } from '@playwright/test'

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
  })

  test('正常なログインフロー', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPass123')
    await page.click('button[type="submit"]')
    
    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('ダッシュボード')
  })

  test('無効な認証情報でのログイン', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=認証に失敗しました')).toBeVisible()
  })

  test('必須フィールドの検証', async ({ page }) => {
    await page.click('button[type="submit"]')
    
    // バリデーションメッセージが表示されることを確認
    await expect(page.locator('text=メールアドレスは必須です')).toBeVisible()
    await expect(page.locator('text=パスワードは必須です')).toBeVisible()
  })

  test('ログアウトフロー', async ({ page }) => {
    // ログイン
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPass123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
    
    // ログアウト
    await page.click('button[aria-label="ユーザーメニュー"]')
    await page.click('text=ログアウト')
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/auth/signin')
  })
}) 