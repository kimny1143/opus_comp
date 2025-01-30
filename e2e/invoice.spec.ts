import { test, expect } from '@playwright/test'
import { commonValidation } from '@/types/validation/commonValidation'
import { setupAuthState } from './helpers/auth.helper'

test.describe('請求書フォーム', () => {
  test.beforeEach(async ({ page }) => {
    // 認証状態のセットアップ
    await setupAuthState(page)
    
    // 請求書フォームページに移動
    await page.goto('http://localhost:3000/invoices/new')
    
    // ページの読み込みを待機
    await page.waitForLoadState('domcontentloaded')
    await page.waitForLoadState('networkidle')
    
    // ローディングスピナーが消えるのを待機
    await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: 30000 })
    
    // フォームのレンダリングを待機
    await page.waitForSelector('[data-testid="invoice-form"]', { state: 'visible', timeout: 30000 })
  })

  test('必須項目のバリデーション', async ({ page }) => {
    // 空の状態で送信
    await page.getByRole('button', { name: '保存' }).click()

    // エラーメッセージの確認
    await expect(page.getByText('品目は1つ以上必要です')).toBeVisible()
    await expect(page.getByText('銀行名は必須です')).toBeVisible()
    await expect(page.getByText('支店名は必須です')).toBeVisible()
    await expect(page.getByText('口座番号は必須です')).toBeVisible()
    await expect(page.getByText('口座名義は必須です')).toBeVisible()
  })

  test('税率のバリデーション', async ({ page }) => {
    // 品目を追加
    await page.getByRole('button', { name: '品目を追加' }).click()
    
    // 無効な税率を入力
    await page.getByLabel('税率').fill('0.07')
    await page.getByRole('button', { name: '保存' }).click()
    
    // エラーメッセージの確認
    await expect(page.getByText('税率は8%以上を入力してください')).toBeVisible()
    
    // 有効な税率を入力
    await page.getByLabel('税率').fill('0.08')
    await expect(page.getByText('税率は8%以上を入力してください')).not.toBeVisible()
  })

  test('日付のバリデーション', async ({ page }) => {
    // 支払期限を発行日より前に設定
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    await page.getByLabel('発行日').fill(today.toISOString().split('T')[0])
    await page.getByLabel('支払期限').fill(yesterday.toISOString().split('T')[0])
    await page.getByRole('button', { name: '保存' }).click()
    
    // エラーメッセージの確認
    await expect(page.getByText('支払期限は発行日以降の日付を指定してください')).toBeVisible()
    
    // 有効な日付を入力
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    await page.getByLabel('支払期限').fill(tomorrow.toISOString().split('T')[0])
    await expect(page.getByText('支払期限は発行日以降の日付を指定してください')).not.toBeVisible()
  })

  test('登録番号のバリデーション', async ({ page }) => {
    // 無効な登録番号を入力
    await page.getByLabel('登録番号').fill('123456789012')
    await page.getByRole('button', { name: '保存' }).click()
    
    // エラーメッセージの確認
    await expect(page.getByText('登録番号はTで始まる13桁の数字である必要があります')).toBeVisible()
    
    // 有効な登録番号を入力
    await page.getByLabel('登録番号').fill('T1234567890123')
    await expect(page.getByText('登録番号はTで始まる13桁の数字である必要があります')).not.toBeVisible()
  })
}) 