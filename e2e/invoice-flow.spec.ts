import { test, expect } from '@playwright/test'
import { setupAuthState, setupVendorAuthState } from './helpers/auth.helper'

test.describe('請求書作成フロー(社内ユーザー)', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await setupAuthState(page)
    await page.goto('/invoices')
    await page.waitForLoadState('networkidle')
  })

  test('インボイス制度に準拠した請求書の作成', async ({ page }) => {
    await page.click('text=新規作成')
    await page.waitForURL('**/invoices/new')

    // 基本情報の入力
    await page.fill('input[name="invoiceNumber"]', 'INV-2024-001')
    await page.fill('input[name="issueDate"]', '2024-03-01')
    await page.fill('input[name="dueDate"]', '2024-03-31')
    await page.fill('input[name="registrationNumber"]', 'T1234567890123')

    // 取引先の選択
    await page.click('button[aria-label="取引先を選択"]')
    await page.fill('input[placeholder="取引先を検索"]', 'テスト取引先')
    await page.click('text=テスト取引先')

    // 品目の追加(軽減税率対象品目を含む)
    await page.click('button[aria-label="品目を追加"]')
    await page.fill('input[name="items.0.itemName"]', '食料品A')
    await page.fill('input[name="items.0.quantity"]', '2')
    await page.fill('input[name="items.0.unitPrice"]', '1000')
    await page.selectOption('select[name="items.0.taxRate"]', '0.08')
    await page.fill('input[name="items.0.description"]', '軽減税率対象品目')

    await page.click('button[aria-label="品目を追加"]')
    await page.fill('input[name="items.1.itemName"]', '商品B')
    await page.fill('input[name="items.1.quantity"]', '1')
    await page.fill('input[name="items.1.unitPrice"]', '2000')
    await page.selectOption('select[name="items.1.taxRate"]', '0.1')
    await page.fill('input[name="items.1.description"]', '標準税率対象品目')

    // 保存
    await page.click('button[type="submit"]')
    await expect(page.locator('text=請求書を作成しました')).toBeVisible()

    // 税率ごとの集計を確認
    await expect(page.locator('text=軽減税率(8%)')).toBeVisible()
    await expect(page.locator('text=標準税率(10%)')).toBeVisible()
  })

  test('PDF出力とメール送信の連携', async ({ page }) => {
    // 請求書の選択
    await page.click('text=INV-2024-001')

    // PDF出力の確認
    const downloadPromise = page.waitForEvent('download')
    await page.click('button[aria-label="PDFをダウンロード"]')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/INV-2024-001.*\.pdf$/)

    // メール送信
    await page.click('button[aria-label="メールで送信"]')
    await page.fill('input[name="to"]', 'vendor@example.com')
    await page.fill('textarea[name="message"]', '請求書を送付いたします。')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=メールを送信しました')).toBeVisible()

    // 送信履歴の確認
    await page.click('button[aria-label="送信履歴"]')
    await expect(page.locator('text=vendor@example.com')).toBeVisible()
    await expect(page.locator('text=送信済み')).toBeVisible()
  })
})

test.describe('請求書作成フロー(外部ユーザー)', () => {
  test.use({ storageState: 'playwright/.auth/vendor.json' });

  test.beforeEach(async ({ page }) => {
    await setupVendorAuthState(page)
    await page.goto('/vendor-portal')
    await page.waitForLoadState('networkidle')
  })

  test('外部ユーザーによる請求書作成と提出', async ({ page }) => {
    await page.click('text=請求書を作成')

    // 基本情報の入力
    await page.fill('input[name="invoiceNumber"]', 'INV-V-2024-001')
    await page.fill('input[name="issueDate"]', '2024-03-01')
    await page.fill('input[name="dueDate"]', '2024-03-31')
    await page.fill('input[name="registrationNumber"]', 'T9876543210987')

    // 品目の追加
    await page.click('button[aria-label="品目を追加"]')
    await page.fill('input[name="items.0.itemName"]', 'コンサルティング')
    await page.fill('input[name="items.0.quantity"]', '1')
    await page.fill('input[name="items.0.unitPrice"]', '100000')
    await page.selectOption('select[name="items.0.taxRate"]', '0.1')

    // 銀行口座情報の入力
    await page.fill('input[name="bankInfo.bankName"]', 'テスト銀行')
    await page.fill('input[name="bankInfo.branchName"]', 'テスト支店')
    await page.fill('input[name="bankInfo.accountNumber"]', '1234567')
    await page.fill('input[name="bankInfo.accountHolder"]', 'テスト太郎')

    // 下書き保存
    await page.click('button[text="下書き保存"]')
    await expect(page.locator('text=下書きを保存しました')).toBeVisible()

    // プレビュー確認
    await page.click('button[aria-label="プレビュー"]')
    await expect(page.locator('text=INV-V-2024-001')).toBeVisible()
    await expect(page.locator('text=¥100,000')).toBeVisible()
    await page.click('button[aria-label="プレビューを閉じる"]')

    // 提出
    await page.click('button[text="提出"]')
    await expect(page.locator('text=請求書を提出しました')).toBeVisible()

    // ステータスの確認
    await expect(page.locator('text=承認待ち')).toBeVisible()
  })

  test('外部ユーザーによる請求書の編集と再提出', async ({ page }) => {
    // 却下された請求書の選択
    await page.click('text=INV-V-2024-002')
    await expect(page.locator('text=却下')).toBeVisible()

    // 編集
    await page.click('button[text="編集"]')
    await page.fill('input[name="items.0.unitPrice"]', '90000')
    await page.fill('textarea[name="notes"]', '金額を修正しました')

    // 再提出
    await page.click('button[text="再提出"]')
    await expect(page.locator('text=請求書を再提出しました')).toBeVisible()
    await expect(page.locator('text=承認待ち')).toBeVisible()
  })

  test('外部ユーザーによる請求書の一覧と検索', async ({ page }) => {
    // ステータスによるフィルタリング
    await page.click('button[aria-label="ステータスでフィルタ"]')
    await page.click('text=承認待ち')
    await expect(page.locator('text=承認待ち')).toBeVisible()

    // 期間による絞り込み
    await page.fill('input[name="dateFrom"]', '2024-03-01')
    await page.fill('input[name="dateTo"]', '2024-03-31')
    await page.click('button[aria-label="日付で絞り込み"]')
    await expect(page.locator('text=2024-03')).toBeVisible()

    // キーワード検索
    await page.fill('input[placeholder="検索"]', 'コンサルティング')
    await page.press('input[placeholder="検索"]', 'Enter')
    await expect(page.locator('text=コンサルティング')).toBeVisible()
  })
})