import { test as setup, expect } from '@playwright/test';

setup('認証セットアップ', async ({ page }) => {
  // デバッグログ設定
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));

  try {
    await page.goto('/auth/signin');
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);

    // ハイドレーションの完了を待機
    await page.waitForFunction(() => {
      return !document.documentElement.classList.contains('hydrating');
    });

    // サインインカードが表示されるまで待機
    await page.waitForSelector('[data-testid="signin-card"]', { 
      state: 'visible',
      timeout: 30000
    });

    // 環境変数からテストユーザー情報を取得
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;

    if (!testEmail || !testPassword) {
      throw new Error('テストユーザーの認証情報が環境変数に設定されていません');
    }

    // フォームの入力
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);

    // サブミット
    await page.click('button[type="submit"]');

    // ダッシュボードへのリダイレクトを待機
    await page.waitForURL('/dashboard', { timeout: 30000 });

    // 認証状態を保存
    await page.context().storageState({
      path: 'playwright/.auth/user.json'
    });

  } catch (error) {
    console.error('認証セットアップ失敗:', error);
    
    // エラー時のスクリーンショットを保存
    await page.screenshot({ 
      path: 'test-results/auth-setup-error.png',
      fullPage: true 
    });
    
    // HTMLスナップショットを保存
    const html = await page.content();
    require('fs').writeFileSync(
      'test-results/auth-setup-error.html',
      html
    );

    throw error;
  }
});