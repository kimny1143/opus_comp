import { test, expect } from '@playwright/test';
import { setupAuthState } from './helpers/auth.helper';

test.describe('購入フォーム基本テスト', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthState(page);
  });

  test('購入フォームへの移動テスト', async ({ page }) => {
    console.log('テスト開始: 購入フォームへの移動');
    
    // 1. 購入フォームページへ移動
    await page.goto('/purchase-orders/new');
    await page.waitForLoadState('networkidle');
    console.log('購入フォームページへの移動完了');
    
    // 2. フォーム要素の存在確認
    const form = await page.waitForSelector('[data-testid="purchase-order-form"]');
    const addItemButton = await page.waitForSelector('[data-testid="add-item-button"]');
    console.log('フォーム要素の存在を確認');
    
    // 3. フォームの表示確認
    expect(form).toBeTruthy();
    expect(addItemButton).toBeTruthy();
    console.log('フォーム表示確認完了');
    
    // スクリーンショット保存
    await page.screenshot({ path: 'purchase-form-success.png' });
  });
}); 