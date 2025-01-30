import { test, expect } from '@playwright/test';

test.describe('取引先管理', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/vendors');
  });

  test('取引先の新規登録', async ({ page }) => {
    await page.click('text=新規登録');
    await page.fill('input[name="name"]', 'テスト株式会社');
    await page.fill('input[name="email"]', 'test-vendor@example.com');
    await page.fill('input[name="registrationNumber"]', 'T123456789012');
    await page.fill('input[name="phoneNumber"]', '03-1234-5678');
    
    // 住所情報の入力
    await page.fill('input[name="address.postalCode"]', '100-0001');
    await page.fill('input[name="address.prefecture"]', '東京都');
    await page.fill('input[name="address.city"]', '千代田区');
    await page.fill('input[name="address.street"]', '丸の内1-1-1');
    
    await page.click('button[type="submit"]');
    
    // 登録完了の確認
    await expect(page.locator('text=取引先を登録しました')).toBeVisible();
  });

  test('取引先情報の編集', async ({ page }) => {
    await page.click('text=テスト株式会社');
    await page.click('text=編集');
    await page.fill('input[name="phoneNumber"]', '03-9876-5432');
    await page.click('button[type="submit"]');
    
    // 更新完了の確認
    await expect(page.locator('text=取引先情報を更新しました')).toBeVisible();
  });

  test('取引先の検索', async ({ page }) => {
    await page.fill('input[placeholder="検索"]', 'テスト株式会社');
    await page.press('input[placeholder="検索"]', 'Enter');
    
    // 検索結果の確認
    await expect(page.locator('text=テスト株式会社')).toBeVisible();
    await expect(page.locator('text=test-vendor@example.com')).toBeVisible();
  });

  test('取引先のタグ管理', async ({ page }) => {
    await page.click('text=テスト株式会社');
    await page.click('button[aria-label="タグを追加"]');
    await page.fill('input[name="tagName"]', '重要取引先');
    await page.click('button[type="submit"]');
    
    // タグ追加の確認
    await expect(page.locator('text=重要取引先')).toBeVisible();
  });
}); 