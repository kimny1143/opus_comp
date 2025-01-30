import { test, expect } from '@playwright/test'

test.describe('パフォーマンステスト', () => {
  test.beforeEach(async ({ page }) => {
    // ページに遷移し、DOMとネットワークがロードされるまで待つ
    await page.goto('/purchase-orders/new', {
      waitUntil: 'networkidle'
    })

    // フォームが表示されるまで待つ
    await page.waitForSelector('form')

    // 「品目を追加」ボタンが表示されるまで待つ
    await page.waitForSelector('button:has-text("品目を追加")')
    
    // 最初の品目を追加
    await page.click('button:has-text("品目を追加")')
  })

  test('発注フォームの入力レスポンス', async ({ page }) => {
    // 品目名フィールドが表示されるまで待つ
    await page.waitForSelector('input[name="items.0.name"]')

    // 入力レスポンスのテスト
    const startTime = Date.now()
    await page.locator('input[name="items.0.name"]').fill('テスト商品')
    const endTime = Date.now()
    
    expect(endTime - startTime).toBeLessThan(100) // 100ms以内の入力レスポンス
  })

  test('バリデーションの実行速度', async ({ page }) => {
    // 税率フィールドが表示されるまで待つ
    await page.waitForSelector('input[name="items.0.taxRate"]')

    // バリデーションの実行速度テスト
    const startTime = Date.now()
    await page.locator('input[name="items.0.taxRate"]').fill('-1')
    await page.locator('input[name="items.0.name"]').click() // フォーカスを外してバリデーションをトリガー
    await page.waitForSelector('text=税率は8%以上を入力してください', { timeout: 5000 })
    const endTime = Date.now()

    expect(endTime - startTime).toBeLessThan(200) // 200ms以内のバリデーション
  })

  test('大量のアイテム追加時のパフォーマンス', async ({ page, browser }) => {
    const startTime = Date.now()
    // 10個のアイテムを追加（1つは既に追加済み）
    for (let i = 0; i < 9; i++) {
      await page.click('button:has-text("品目を追加")')
      // 新しいアイテムフォームが表示されるまで待つ
      await page.waitForSelector(`input[name="items.${i + 1}.name"]`)
    }
    const endTime = Date.now()

    expect(endTime - startTime).toBeLessThan(1000) // 1秒以内でのアイテム追加
    
    // メモリ使用量の確認（Chromiumのみ）
    if (browser.browserType().name() === 'chromium') {
      const client = await page.context().newCDPSession(page)
      const result = await client.send('Performance.getMetrics')
      const jsHeapSize = result.metrics.find(m => m.name === 'JSHeapUsedSize')?.value
      expect(jsHeapSize).toBeLessThan(50 * 1024 * 1024) // 50MB以下のメモリ使用
    }
  })
}) 