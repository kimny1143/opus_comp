import { test, expect } from '@playwright/test'
import { test as authTest } from '@/lib/test/auth-helpers'
import { prisma } from '@/lib/prisma'

test.describe('タグ管理', () => {
  // 認証済みのテストケース
  authTest('タグの作成と一覧表示', async ({ authenticatedPage: page }) => {
    // タグ管理ページに移動
    await page.goto('/settings/tags')

    // タグの作成
    await page.click('button[aria-label="タグを追加"]')
    await page.fill('input[name="name"]', 'テストタグ')
    await page.click('button[type="submit"]')

    // 作成したタグが表示されることを確認
    await expect(page.locator('text=テストタグ')).toBeVisible()
  })

  authTest('タグの編集', async ({ authenticatedPage: page }) => {
    // テストデータの作成
    const tag = await prisma.tag.create({
      data: {
        name: '編集前のタグ'
      }
    })

    // タグ管理ページに移動
    await page.goto('/settings/tags')

    // タグの編集
    await page.click(`button[aria-label="タグ「${tag.name}」を編集"]`)
    await page.fill('input[name="name"]', '編集後のタグ')
    await page.click('button[type="submit"]')

    // 編集後のタグ名が表示されることを確認
    await expect(page.locator('text=編集後のタグ')).toBeVisible()
    await expect(page.locator('text=編集前のタグ')).not.toBeVisible()
  })

  authTest('タグの削除', async ({ authenticatedPage: page }) => {
    // テストデータの作成
    const tag = await prisma.tag.create({
      data: {
        name: '削除するタグ'
      }
    })

    // タグ管理ページに移動
    await page.goto('/settings/tags')

    // タグの削除
    await page.click(`button[aria-label="タグ「${tag.name}」を削除"]`)
    await page.click('button[aria-label="削除を確認"]')

    // 削除したタグが表示されないことを確認
    await expect(page.locator('text=削除するタグ')).not.toBeVisible()
  })

  authTest('タグのバリデーション', async ({ authenticatedPage: page }) => {
    // タグ管理ページに移動
    await page.goto('/settings/tags')

    // タグの作成を試みる
    await page.click('button[aria-label="タグを追加"]')
    await page.click('button[type="submit"]')

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=タグ名は必須です')).toBeVisible()
  })

  authTest('重複タグのチェック', async ({ authenticatedPage: page }) => {
    // テストデータの作成
    const tag = await prisma.tag.create({
      data: {
        name: '既存のタグ'
      }
    })

    // タグ管理ページに移動
    await page.goto('/settings/tags')

    // 同じ名前のタグを作成しようとする
    await page.click('button[aria-label="タグを追加"]')
    await page.fill('input[name="name"]', tag.name)
    await page.click('button[type="submit"]')

    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=このタグ名は既に使用されています')).toBeVisible()
  })

  // テスト後のクリーンアップ
  test.afterEach(async () => {
    await prisma.tag.deleteMany()
  })
}) 