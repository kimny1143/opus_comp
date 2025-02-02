import { test, expect } from '@playwright/test'
import { setupAuthState } from './helpers/auth.helper'

test.describe('発注管理フロー', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await setupAuthState(page)
    await page.goto('/purchase-orders')
    await page.waitForLoadState('networkidle')
  })

  test('発注書の作成から承認までのフロー', async ({ page }) => {
    // 新規作成画面へ遷移
    await page.click('text=新規作成')
    await page.waitForURL('**/purchase-orders/new')

    // 基本情報の入力
    await page.fill('input[name="orderNumber"]', 'PO-2024-001')
    await page.fill('input[name="orderDate"]', '2024-03-01')
    await page.fill('input[name="deliveryDate"]', '2024-03-31')

    // 取引先の選択
    await page.click('button[aria-label="取引先を選択"]')
    await page.fill('input[placeholder="取引先を検索"]', 'テスト取引先')
    await page.click('text=テスト取引先')

    // 品目の追加(50件)
    for (let i = 0; i < 50; i++) {
      if (i > 0) {
        await page.click('button[aria-label="品目を追加"]')
      }
      await page.fill(`input[name="items.${i}.itemName"]`, `テスト商品${i + 1}`)
      await page.fill(`input[name="items.${i}.quantity"]`, '1')
      await page.fill(`input[name="items.${i}.unitPrice"]`, '1000')
      await page.selectOption(`select[name="items.${i}.taxRate"]`, '0.1')
    }

    // 保存
    await page.click('button[type="submit"]')
    await expect(page.locator('text=発注書を作成しました')).toBeVisible()

    // 作成された発注書の確認
    await expect(page.locator('text=PO-2024-001')).toBeVisible()
    await expect(page.locator('text=下書き')).toBeVisible()

    // ステータスの変更(承認プロセス)
    await page.click('text=PO-2024-001')
    await page.click('button[aria-label="ステータスを変更"]')
    await page.click('text=承認待ち')
    await expect(page.locator('text=承認待ち')).toBeVisible()

    // 承認者による承認
    await page.click('button[aria-label="承認"]')
    await expect(page.locator('text=発注済み')).toBeVisible()
  })

  test('大量データの品目入力パフォーマンス', async ({ page }) => {
    await page.click('text=新規作成')

    // 基本情報の入力
    await page.fill('input[name="orderNumber"]', 'PO-2024-002')
    await page.fill('input[name="orderDate"]', '2024-03-01')
    await page.fill('input[name="deliveryDate"]', '2024-03-31')

    // 100件の品目を一括で追加
    const items = Array.from({ length: 100 }, (_, i) => ({
      itemName: `テスト商品${i + 1}`,
      quantity: 1,
      unitPrice: 1000,
      taxRate: 0.1
    }))

    // パフォーマンス計測開始
    const startTime = Date.now()

    // 品目の追加
    for (let i = 0; i < items.length; i++) {
      if (i > 0) {
        await page.click('button[aria-label="品目を追加"]')
      }
      await page.fill(`input[name="items.${i}.itemName"]`, items[i].itemName)
      await page.fill(`input[name="items.${i}.quantity"]`, items[i].quantity.toString())
      await page.fill(`input[name="items.${i}.unitPrice"]`, items[i].unitPrice.toString())
      await page.selectOption(`select[name="items.${i}.taxRate"]`, items[i].taxRate.toString())
    }

    // パフォーマンス計測終了
    const endTime = Date.now()
    const duration = endTime - startTime

    // 処理時間が10秒以内であることを確認
    expect(duration).toBeLessThan(10000)

    // 保存が正常に完了することを確認
    await page.click('button[type="submit"]')
    await expect(page.locator('text=発注書を作成しました')).toBeVisible()
  })

  test('発注書の検索とフィルタリング', async ({ page }) => {
    // 検索
    await page.fill('input[placeholder="検索"]', 'PO-2024')
    await page.press('input[placeholder="検索"]', 'Enter')
    await expect(page.locator('text=PO-2024-001')).toBeVisible()

    // ステータスでフィルタリング
    await page.click('button[aria-label="ステータスでフィルタ"]')
    await page.click('text=発注済み')
    await expect(page.locator('text=発注済み')).toBeVisible()

    // 日付範囲でフィルタリング
    await page.fill('input[name="dateFrom"]', '2024-03-01')
    await page.fill('input[name="dateTo"]', '2024-03-31')
    await page.click('button[aria-label="日付で絞り込み"]')
    await expect(page.locator('text=2024-03')).toBeVisible()
  })

  test('発注書の編集と更新', async ({ page }) => {
    await page.click('text=PO-2024-001')
    await page.click('text=編集')

    // 納期の変更
    await page.fill('input[name="deliveryDate"]', '2024-04-30')

    // 品目の追加
    await page.click('button[aria-label="品目を追加"]')
    await page.fill('input[name="items.50.itemName"]', '追加商品')
    await page.fill('input[name="items.50.quantity"]', '1')
    await page.fill('input[name="items.50.unitPrice"]', '2000')
    await page.selectOption('select[name="items.50.taxRate"]', '0.1')

    // 保存
    await page.click('button[type="submit"]')
    await expect(page.locator('text=発注書を更新しました')).toBeVisible()

    // 変更内容の確認
    await expect(page.locator('text=2024-04-30')).toBeVisible()
    await expect(page.locator('text=追加商品')).toBeVisible()
  })

  test('発注書の進捗管理', async ({ page }) => {
    await page.click('text=PO-2024-001')

    // 進捗ステータスの更新
    await page.click('button[aria-label="進捗を更新"]')
    await page.click('text=納品済み')
    await expect(page.locator('text=納品済み')).toBeVisible()

    // コメントの追加
    await page.fill('textarea[name="comment"]', '納品確認完了')
    await page.click('button[aria-label="コメントを追加"]')
    await expect(page.locator('text=納品確認完了')).toBeVisible()

    // 履歴の確認
    await page.click('button[aria-label="履歴を表示"]')
    await expect(page.locator('text=ステータスを「納品済み」に更新')).toBeVisible()
  })
})