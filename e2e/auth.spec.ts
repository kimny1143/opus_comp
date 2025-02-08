import { test, expect } from '@playwright/test'
import { createHash } from 'crypto'

// テストユーザーの設定
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
}

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
  })

  test('正常なログインフロー', async ({ page }) => {
    // ログインフォームの表示確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
    
    // フォーム入力
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    
    // 送信とリダイレクト待機
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'ログイン' }).click()
    ])
    
    // ログイン後の状態確認
    await expect(page).toHaveURL('/')
    await expect(page.getByText(TEST_USER.email)).toBeVisible()
    
    // セキュリティヘッダーの確認
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/auth/session') && response.status() === 200
    )
    const headers = response.headers()
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['strict-transport-security']).toBeTruthy()
  })

  test('無効な認証情報でのログイン', async ({ page }) => {
    // 無効なパスワードでログイン試行
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill('WrongPassword123!')
    await page.getByRole('button', { name: 'ログイン' }).click()
    
    // エラーメッセージの確認
    await expect(page.getByText('認証に失敗しました')).toBeVisible()
    
    // URLが変更されていないことを確認
    await expect(page).toHaveURL('/auth/signin')
  })

  test('レート制限の動作確認', async ({ page }) => {
    // 複数回の失敗ログイン試行
    for (let i = 0; i < 6; i++) {
      await page.getByLabel('Email').fill(TEST_USER.email)
      await page.getByLabel('Password').fill(`WrongPassword${i}`)
      await page.getByRole('button', { name: 'ログイン' }).click()
      await page.waitForLoadState('networkidle')
    }
    
    // レート制限エラーの確認
    await expect(page.getByText('一時的にログインがブロックされています')).toBeVisible()
  })

  test('セッション管理の検証', async ({ page, context }) => {
    // 正常ログイン
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'ログイン' }).click()
    ])
    
    // セッションCookieの検証
    const cookies = await context.cookies()
    const sessionCookie = cookies.find(c => c.name === 'next-auth.session-token')
    expect(sessionCookie).toBeTruthy()
    expect(sessionCookie?.secure).toBe(true)
    expect(sessionCookie?.httpOnly).toBe(true)
    
    // 新しいページでセッションが維持されていることを確認
    const newPage = await context.newPage()
    await newPage.goto('/')
    await expect(newPage.getByText(TEST_USER.email)).toBeVisible()
  })

  test('ログアウトとセッション破棄', async ({ page, context }) => {
    // ログイン
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'ログイン' }).click()
    ])
    
    // ログアウト
    await page.getByRole('button', { name: 'ログアウト' }).click()
    
    // セッションが破棄されていることを確認
    await expect(page).toHaveURL('/auth/signin')
    const cookies = await context.cookies()
    const sessionCookie = cookies.find(c => c.name === 'next-auth.session-token')
    expect(sessionCookie).toBeUndefined()
  })

  test('CSRF対策の検証', async ({ page }) => {
    // CSRFトークンの存在確認
    const csrfToken = await page.evaluate(() => {
      const input = document.querySelector('input[name="csrfToken"]') as HTMLInputElement
      return input?.value
    })
    expect(csrfToken).toBeTruthy()
    
    // 無効なCSRFトークンでのログイン試行
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password,
          csrfToken: 'invalid-token',
        }),
      })
      return res.status
    })
    
    expect(response).toBe(403)
  })

  test('同時セッション数の制限', async ({ browser }) => {
    // 複数のセッションを作成
    const maxSessions = 5
    const contexts = []
    
    for (let i = 0; i < maxSessions + 1; i++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      await page.goto('/auth/signin')
      await page.getByLabel('Email').fill(TEST_USER.email)
      await page.getByLabel('Password').fill(TEST_USER.password)
      await page.getByRole('button', { name: 'ログイン' }).click()
      await page.waitForLoadState('networkidle')
      contexts.push(context)
    }
    
    // 最後のセッションでエラーメッセージを確認
    const lastPage = await contexts[contexts.length - 1].newPage()
    await lastPage.goto('/')
    await expect(lastPage.getByText('アクティブなセッション数が上限を超えています')).toBeVisible()
    
    // コンテキストのクリーンアップ
    for (const context of contexts) {
      await context.close()
    }
  })
})