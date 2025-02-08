import { test as setup } from '@playwright/test'

// 認証セットアップ
setup('認証セットアップ', async ({ page }) => {
  // 認証ページに移動
  await page.goto('/auth/signin')
  
  // ログインフォームが表示されるまで待機
  await page.waitForSelector('form[name="signin-form"]', { state: 'visible' })
  
  // テストユーザーでログイン
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL || 'test@example.com')
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!')
  await page.getByRole('button', { name: 'ログイン' }).click()
  
  // ログイン完了を待機
  await page.waitForURL('/')
  
  // ストレージステートを保存
  await page.context().storageState({
    path: 'e2e/.auth/user.json'
  })
})