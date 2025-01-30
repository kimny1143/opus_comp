import { test as setup, expect } from '@playwright/test';

setup('認証セットアップ', async ({ page }) => {
  // テストユーザーでログイン
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'TestPass123');
  await page.click('button[type="submit"]');
  
  // ログインの成功を確認
  await expect(page).toHaveURL('/dashboard');
  
  // 認証情報を保存
  await page.context().storageState({
    path: 'playwright/.auth/user.json'
  });
}); 