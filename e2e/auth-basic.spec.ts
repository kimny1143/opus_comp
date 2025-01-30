import { test, expect } from '@playwright/test';

// シリアルモードを強制
test.describe.configure({ mode: 'serial' });

test.describe('基本認証テスト', () => {
  test('ログインのみのテスト', async ({ page }) => {
    console.log('テスト開始: ログインのみ');
    
    // 現在のコンテキストの状態を確認
    const initialCookies = await page.context().cookies();
    console.log('初期Cookie状態:', {
      count: initialCookies.length,
      names: initialCookies.map(c => c.name)
    });

    // 単純なページアクセスのみを試行
    console.log('トップページへアクセス');
    await page.goto('http://localhost:3000/');
    console.log('トップページアクセス完了');

    // 現在のURLを確認
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);

    // スクリーンショット保存
    await page.screenshot({ path: `debug-${Date.now()}.png` });
  });
}); 