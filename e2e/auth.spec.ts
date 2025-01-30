import { test, expect } from '@playwright/test'
import { createTestUser, loginAsTestUser } from '@/lib/test/auth-helpers'
import { validationMessages } from '@/lib/validations/messages'

test.describe('認証フロー', () => {
  test('正常なログインフロー', async ({ page }) => {
    // テストユーザーを作成
    const user = await createTestUser()

    // ログイン
    await loginAsTestUser(page)

    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL('/dashboard')
  })

  test('無効な認証情報でのログイン', async ({ page }) => {
    await page.goto('/auth/signin')

    // 無効なメールアドレスとパスワードを入力
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=' + validationMessages.auth.invalidCredentials)).toBeVisible()
  })

  test('必須フィールドの検証', async ({ page }) => {
    await page.goto('/auth/signin')

    // 空の状態でフォームを送信
    await page.click('button[type="submit"]')

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=' + validationMessages.auth.required)).toBeVisible()
  })

  test('ログアウトフロー', async ({ page }) => {
    // ログイン
    await loginAsTestUser(page)

    // ログアウトボタンをクリック
    await page.click('button[aria-label="ログアウト"]')

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/auth/signin')
  })

  test('認証が必要なページへのアクセス制御', async ({ page }) => {
    // 認証が必要なページに未ログイン状態でアクセス
    await page.goto('/dashboard')

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/auth/signin')
  })
}) 