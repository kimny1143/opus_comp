import { test, expect } from '@playwright/test';

// シリアルモードを強制
test.describe.configure({ mode: 'serial' });

test.describe('基本認証テスト', () => {
  test('ログインのみのテスト', async ({ page }) => {
    try {
      console.log('テスト開始: ログインのみ');
      
      // 現在のコンテキストの状態を確認
      const initialCookies = await page.context().cookies();
      console.log('初期Cookie状態:', {
        count: initialCookies.length,
        names: initialCookies.map(c => c.name)
      });

      // トップページアクセス
      console.log('トップページへアクセス');
      await page.goto('http://localhost:3000/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      console.log('トップページアクセス完了');

      // ダッシュボードへのアクセス
      console.log('ダッシュボードへアクセス');
      await page.goto('http://localhost:3000/dashboard', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // ダッシュボードの表示を確認
      await page.waitForSelector('h1:has-text("ダッシュボード")', { 
        timeout: 30000 
      });
      console.log('ダッシュボード表示確認完了');

      // 最終的なCookieの状態を確認
      const finalCookies = await page.context().cookies();
      console.log('最終Cookie状態:', {
        count: finalCookies.length,
        names: finalCookies.map(c => c.name)
      });

      // スクリーンショット保存
      await page.screenshot({ 
        path: `test-results/local/screenshots/basic-auth-success-${Date.now()}.png`,
        fullPage: true 
      });

    } catch (error) {
      console.error('テスト実行中にエラーが発生:', error);
      // エラー時のスクリーンショットとHTML保存
      await page.screenshot({ 
        path: `test-results/local/screenshots/basic-auth-error-${Date.now()}.png`, 
        fullPage: true 
      });
      const html = await page.content();
      await require('fs').promises.writeFile(
        `test-results/local/logs/basic-auth-error-${Date.now()}.html`, 
        html
      );
      throw error;
    }
  });
}); 