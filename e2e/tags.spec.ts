import { test, expect } from '@playwright/test'

test.describe('タグ管理', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPass123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')

    // タグ管理ページに移動
    await page.goto('/settings/tags')
  })

  test('タグの作成と一覧表示', async ({ page }) => {
    // タグの作成
    await page.click('button[aria-label="タグを追加"]')
    await page.fill('input[name="name"]', 'テストタグ')
    await page.click('button[type="submit"]')

    // 作成したタグが表示されることを確認
    await expect(page.locator('text=テストタグ')).toBeVisible()
  })

  test('タグの編集', async ({ page }) => {
    const tagName = '編集前のタグ'
    const newTagName = '編集後のタグ'

    // タグの作成
    await page.click('button[aria-label="タグを追加"]')
    await page.fill('input[name="name"]', tagName)
    await page.click('button[type="submit"]')

    // タグの編集
    await page.click(`button[aria-label="タグ「${tagName}」を編集"]`)
    await page.fill('input[name="name"]', newTagName)
    await page.click('button[type="submit"]')

    // 編集後のタグ名が表示されることを確認
    await expect(page.locator(`text=${newTagName}`)).toBeVisible()
  })

  test('タグの削除', async ({ page }) => {
    const tagName = '削除するタグ'

    // タグの作成
    await page.click('button[aria-label="タグを追加"]')
    await page.fill('input[name="name"]', tagName)
    await page.click('button[type="submit"]')

    // タグの削除
    await page.click(`button[aria-label="タグ「${tagName}」を削除"]`)
    await page.click('button[aria-label="削除を確認"]')

    // 削除したタグが表示されないことを確認
    await expect(page.locator(`text=${tagName}`)).not.toBeVisible()
  })

  test('タグのバリデーション', async ({ page }) => {
    // タグの作成を試みる
    await page.click('button[aria-label="タグを追加"]')
    await page.click('button[type="submit"]')

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=タグ名は必須です')).toBeVisible()
  })

  test('重複タグのチェック', async ({ page }) => {
    const tagName = 'テストタグ'

    // 1つ目のタグを作成
    await page.click('button[aria-label="タグを追加"]')
    await page.fill('input[name="name"]', tagName)
    await page.click('button[type="submit"]')

    // 同じ名前のタグを作成しようとする
    await page.click('button[aria-label="タグを追加"]')
    await page.fill('input[name="name"]', tagName)
    await page.click('button[type="submit"]')

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=同じ名前のタグが既に存在します')).toBeVisible()
  })
}) 