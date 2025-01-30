import { test, expect } from '@playwright/test';
import fetch from 'node-fetch';

test.describe('手動ログインテスト', () => {
  test('手動ログインとセッション確認', async ({ page }) => {
    console.log('テスト開始: 手動ログイン');
    
    try {
      // テストユーザーの作成
      console.log('テストユーザーの作成を開始');
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@example.com`;
      const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'TestPassword123',
          name: 'Test User'
        }),
      });
      
      if (!signupResponse.ok && signupResponse.status !== 409) { // 409はユーザーが既に存在する場合
        const errorData = await signupResponse.json();
        console.error('サインアップエラー:', {
          status: signupResponse.status,
          data: errorData
        });
        throw new Error(`テストユーザーの作成に失敗: ${signupResponse.status} - ${JSON.stringify(errorData)}`);
      }
      console.log('テストユーザーの作成完了');

      // ブラウザ情報の確認
      const browserVersion = await page.evaluate(() => navigator.userAgent);
      console.log('ブラウザ情報:', browserVersion);
      
      // 1. ログインページに移動
      console.log('ログインページへの移動を開始');
      const response = await page.goto('http://localhost:3000/auth/signin', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      console.log('ページレスポンス:', {
        status: response?.status(),
        url: response?.url(),
      });
      
      // 現在のURLを確認
      const currentUrl = page.url();
      console.log('現在のURL:', currentUrl);
      
      // 2. フォームの表示を待機
      console.log('フォーム要素の待機を開始');
      const form = await page.waitForSelector('form', { 
        timeout: 30000,
        state: 'visible'
      });
      
      if (!form) {
        throw new Error('フォームが見つかりません');
      }
      
      // フォームのHTML構造を確認
      const formHtml = await form.innerHTML();
      console.log('フォームのHTML:', formHtml);
      
      // 3. 入力フィールドの表示を確認
      const emailInput = await page.waitForSelector('input[name="email"]', { timeout: 30000 });
      const passwordInput = await page.waitForSelector('input[name="password"]', { timeout: 30000 });
      console.log('入力フィールドの確認完了');
      
      if (!emailInput || !passwordInput) {
        throw new Error('入力フィールドが見つかりません');
      }
      
      // 4. フォームに認証情報を入力
      await emailInput.fill(testEmail);
      await passwordInput.fill('TestPassword123');
      console.log('認証情報入力完了');
      
      // 5. 送信ボタンの表示を確認
      const submitButton = await page.waitForSelector('button[type="submit"]', { timeout: 30000 });
      console.log('送信ボタンの確認完了');
      
      if (!submitButton) {
        throw new Error('送信ボタンが見つかりません');
      }
      
      // 6. ログインボタンをクリックし、リダイレクトを待機
      console.log('ログインボタンのクリックを開始');
      await Promise.all([
        page.waitForNavigation({ 
          waitUntil: 'networkidle',
          timeout: 30000 
        }),
        submitButton.click()
      ]);
      console.log('ログインボタンのクリック完了');
      
      // 7. ダッシュボードページへのリダイレクトを確認
      console.log('ダッシュボードページの確認を開始');
      await page.waitForURL('**/dashboard', { timeout: 30000 });
      
      // 8. ダッシュボードの表示を確認
      console.log('ダッシュボード要素の確認を開始');
      await page.waitForSelector('h1:has-text("ダッシュボード")', { timeout: 30000 });
      console.log('ダッシュボード要素の確認完了');
      
    } catch (error) {
      console.error('テスト実行中にエラーが発生:', error);
      // エラー時のスクリーンショットとHTML保存
      await page.screenshot({ path: `error-${Date.now()}.png`, fullPage: true });
      const html = await page.content();
      await require('fs').promises.writeFile(`error-${Date.now()}.html`, html);
      throw error;
    }
  });
}); 