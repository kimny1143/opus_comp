import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// スクリーンショット保存ディレクトリの作成
const screenshotDir = path.join(process.cwd(), 'test-results')
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true })
}

// 認証セットアップ
setup('認証セットアップ', async ({ browser }) => {
  console.log('認証セットアップを開始')
  
  // 新しいコンテキストを毎回作成(再利用しない)
  const context = await browser.newContext({
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    recordVideo: {
      dir: 'test-results/videos'
    }
  })

  try {
    // 既存のページをすべて閉じる
    const pages = await context.pages()
    await Promise.all(pages.map(page => page.close()))

    console.log('新しいページを作成')
    const page = await context.newPage()

    // コンソールログの収集を開始
    page.on('console', msg => {
      fs.appendFileSync(
        path.join(screenshotDir, 'browser-console.log'),
        `[${msg.type()}] ${msg.text()}\n`
      )
    })

    // 認証ページに直接移動
    console.log('認証ページへ移動を開始')
    await page.goto('/auth/signin', {
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

    // フォームが完全に読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded')
    await page.waitForLoadState('networkidle')

    // テストユーザーでログイン
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL || 'test@example.com')
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!')
    
    console.log('認証情報を入力完了')

    // フォーム送信とナビゲーション完了を待機
    console.log('ログインボタンをクリック')
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle',
        timeout: 30000
      }),
      page.getByRole('button', { name: 'ログイン' }).click()
    ])
    
    console.log('ナビゲーション完了を待機')

    // ログイン後のページ遷移を確認
    await page.waitForURL('/', {
      timeout: 30000,
      waitUntil: 'networkidle'
    })
    
    console.log('ホームページへの遷移を確認')

    // ログイン状態の検証
    await expect(page.getByText(process.env.TEST_USER_EMAIL || 'test@example.com')).toBeVisible({
      timeout: 15000
    })
    
    console.log('ログイン状態の検証完了')

    // 認証状態を保存
    const authDir = path.join(process.cwd(), 'e2e/.auth')
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true })
    }

    await context.storageState({
      path: path.join(authDir, 'user.json')
    })
    
    console.log('認証状態を保存完了')

    // 成功時のスクリーンショット
    await page.screenshot({
      path: path.join(screenshotDir, 'auth-setup-success.png'),
      fullPage: true
    })
    
  } catch (error) {
    console.error('認証セットアップ中にエラーが発生:', error)
    
    try {
      // エラー時のスクリーンショットとビデオを保存
      const page = await context.pages()[0]
      if (page) {
        const screenshotPath = path.join(screenshotDir, 'auth-setup-error.png')
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        })
        console.log('エラー時のスクリーンショットを保存:', screenshotPath)
        
        // ページのエラーログを保存
        const errorLogs = await page.evaluate(() => {
          return {
            errors: (window as any).errors || [],
            networkErrors: (window as any).networkErrors || []
          }
        })
        fs.writeFileSync(
          path.join(screenshotDir, 'page-errors.log'),
          JSON.stringify(errorLogs, null, 2)
        )
      }
    } catch (screenshotError) {
      console.error('スクリーンショット保存に失敗:', screenshotError)
    }
    
    throw error
  } finally {
    // コンテキストを必ず閉じる
    console.log('ブラウザコンテキストをクリーンアップ')
    await context.close()
  }
})