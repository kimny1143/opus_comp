import { Page } from '@playwright/test'

/**
 * 社内ユーザー用の認証状態をセットアップ
 */
export async function setupAuthState(page: Page): Promise<void> {
  // ログインページに移動
  await page.goto('/auth/signin')

  // 認証情報を入力
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'TestPass123')
  await page.click('button[type="submit"]')

  // ダッシュボードへのリダイレクトを待機
  await page.waitForURL('**/dashboard')

  // 認証状態を保存
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
}

/**
 * 外部ユーザー(取引先)用の認証状態をセットアップ
 */
export async function setupVendorAuthState(page: Page): Promise<void> {
  // ベンダーポータルのログインページに移動
  await page.goto('/vendor-portal/signin')

  // 認証情報を入力
  await page.fill('input[name="email"]', 'vendor@example.com')
  await page.fill('input[name="password"]', 'VendorPass123')
  await page.click('button[type="submit"]')

  // ベンダーポータルへのリダイレクトを待機
  await page.waitForURL('**/vendor-portal')

  // 認証状態を保存
  await page.context().storageState({ path: 'playwright/.auth/vendor.json' })
}

/**
 * 認証状態をクリア
 */
export async function clearAuthState(page: Page): Promise<void> {
  await page.goto('/auth/signout')
  await page.waitForURL('**/auth/signin')
  await page.context().clearCookies()
}