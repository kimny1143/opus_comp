import { test as setup, chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// 認証セットアップ
setup('認証セットアップ', async () => {
  console.log('認証セットアップを開始')

  // ブラウザを直接起動
  const browser = await chromium.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      'about:blank'
    ]
  })

  try {
    // コンテキストを直接作成(初期ページなし)
    const context = await browser.newContext({
      baseURL: 'http://localhost:3000',
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      javaScriptEnabled: true,
      bypassCSP: true,
      acceptDownloads: false,
      hasTouch: false,
      isMobile: false,
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo'
    })

    console.log('新しいページを作成')
    const page = await context.newPage()

    // 認証ページに直接移動
    console.log('認証ページへ移動を開始')
    await page.goto('/auth/signin', {
      waitUntil: 'networkidle'
    })
    
    console.log('認証ページへの移動完了')

    // ログインフォームが表示されるまで待機
    const form = await page.waitForSelector('form[name="signin-form"]', {
      state: 'visible',
      timeout: 15000
    })
    
    console.log('ログインフォームの表示を確認')

    // テストユーザーでログイン
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL || 'test@example.com')
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!')
    
    console.log('認証情報を入力完了')

    // フォーム送信とナビゲーション完了を待機
    console.log('ログインボタンをクリック')
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle'
      }),
      page.getByRole('button', { name: 'ログイン' }).click()
    ])
    
    console.log('ナビゲーション完了を待機')

    // ログイン後のページ遷移を確認
    await page.waitForURL('/', {
      waitUntil: 'networkidle'
    })
    
    console.log('ホームページへの遷移を確認')

    // 認証状態を保存
    const authDir = path.join(process.cwd(), 'e2e/.auth')
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true })
    }

    await context.storageState({
      path: path.join(authDir, 'user.json')
    })
    
    console.log('認証状態を保存完了')
    
  } catch (error) {
    console.error('認証セットアップ中にエラーが発生:', error)
    throw error
  } finally {
    // ブラウザを必ず閉じる
    console.log('ブラウザをクリーンアップ')
    await browser.close()
  }
})