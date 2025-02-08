import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// 認証セットアップ
setup('認証セットアップ', async ({ browser }) => {
  console.log('認証セットアップを開始')

  // 新しいコンテキストを作成
  const context = await browser.newContext({
    baseURL: 'about:blank',
    viewport: { width: 1280, height: 720 }
  })

  try {
    console.log('新しいページを作成')
    const page = await context.newPage()

    // 初期の不要なナビゲーションが完了するまで待機
    console.log('初期ページの読み込み完了を待機')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForLoadState('networkidle')

    // 認証ページに直接移動(不要なナビゲーションが完了した後)
    console.log('認証ページへ移動を開始')
    await page.goto('http://localhost:3000/auth/signin', {
      waitUntil: 'networkidle',
      timeout: 30000
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
    await page.waitForURL('http://localhost:3000/', {
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
    // コンテキストを必ず閉じる
    await context.close()
    console.log('ブラウザコンテキストをクリーンアップ完了')
  }
})