import { test as setup, expect } from '@playwright/test'

// 認証セットアップ
setup('認証セットアップ', async ({ page }) => {
  // ブラウザコンテキストの準備
  await page.setViewportSize({ width: 1280, height: 720 })
  
  console.log('認証ページへ移動を開始')
  
  try {
    // 認証ページに移動
    await page.goto('/auth/signin', {
      waitUntil: 'networkidle',
      timeout: 30000
    })
    
    console.log('認証ページへの移動完了')

    // ログインフォームが表示されるまで待機
    const form = await page.waitForSelector('form[name="signin-form"]', {
      state: 'visible',
      timeout: 10000
    })
    
    console.log('ログインフォームの表示を確認')

    // フォームが完全に読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000) // 追加の安定化待機

    // テストユーザーでログイン
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL || 'test@example.com')
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!')
    
    console.log('認証情報を入力完了')

    // フォーム送信とナビゲーション完了を待機
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle',
        timeout: 30000
      }),
      page.getByRole('button', { name: 'ログイン' }).click()
    ])
    
    console.log('ログインボタンをクリック、ナビゲーション完了を待機')

    // ログイン後のページ遷移を確認
    await page.waitForURL('/', {
      timeout: 30000,
      waitUntil: 'networkidle'
    })
    
    console.log('ホームページへの遷移を確認')

    // ログイン状態の検証
    await expect(page.getByText(process.env.TEST_USER_EMAIL || 'test@example.com')).toBeVisible({
      timeout: 10000
    })
    
    console.log('ログイン状態の検証完了')

    // ストレージステートを保存
    await page.context().storageState({
      path: 'e2e/.auth/user.json'
    })
    
    console.log('認証状態を保存完了')
    
  } catch (error) {
    console.error('認証セットアップ中にエラーが発生:', error)
    
    // エラー時のスクリーンショットを保存
    await page.screenshot({
      path: 'test-results/auth-setup-error.png',
      fullPage: true
    })
    
    throw error
  }
})