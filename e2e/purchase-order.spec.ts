import { test, expect } from '@playwright/test';
import { getMockOrderItem } from './helpers/purchase-order.helper';
import { setupAuthState } from './helpers/auth.helper';

test.describe('発注フォーム', () => {
  test.beforeEach(async ({ page }) => {
    console.log('発注フォームのセットアップを開始');
    
    // 認証状態のセットアップ
    await setupAuthState(page);
    console.log('認証状態のセットアップ完了');
    
    // 発注フォームページに移動
    try {
      console.log('発注フォームページへの移動を開始');
      
      // 直接URLにアクセス
      await page.goto('http://localhost:3000/purchase-orders/new');
      console.log('発注フォームページのURLにアクセス');
      
      // ページの読み込みを待機
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      console.log('ページの読み込み完了');
      
      // ローディングスピナーの待機（存在する場合）
      try {
        const spinner = await page.waitForSelector('[data-testid="loading-spinner"]', {
          state: 'visible',
          timeout: 5000
        });
        if (spinner) {
          console.log('ローディングスピナーを検出');
          await spinner.waitForElementState('hidden', { timeout: 30000 });
          console.log('ローディングスピナーが非表示になりました');
        }
      } catch (error) {
        console.log('ローディングスピナーは表示されませんでした');
      }
      
      // フォームの表示を待機
      await page.waitForSelector('form, [data-testid="purchase-order-form"]', {
        state: 'visible',
        timeout: 30000
      });
      console.log('フォームの表示を確認');
      
      // 品目追加ボタンの表示を待機
      await page.waitForSelector('button[aria-label="品目を追加"]', {
        state: 'visible',
        timeout: 30000
      });
      console.log('品目追加ボタンの表示を確認');
      
    } catch (error) {
      console.error('発注フォームページへの移動でエラーが発生:', error);
      await page.screenshot({ path: 'form-navigation-error.png' });
      throw error;
    }
  });

  test('基本的なフォーム入力と送信', async ({ page }) => {
    // 品目追加ボタンのクリック
    await page.click('button[aria-label="品目を追加"]');

    // 品目情報の入力
    await page.fill('input[name="items.0.name"]', 'テスト商品');
    await page.fill('input[name="items.0.quantity"]', '10');
    await page.fill('input[name="items.0.unitPrice"]', '1000');
    await page.selectOption('select[name="items.0.taxRate"]', '0.10');

    // フォーム送信
    await page.click('button[type="submit"]');

    // 送信後の状態確認
    await expect(page).toHaveURL(/.*\/purchase-orders\/\d+/);
  });

  test('バリデーションエラー', async ({ page }) => {
    await page.click('button[aria-label="品目を追加"]');

    // 不正な値を入力
    await page.fill('input[name="items.0.name"]', 'a'.repeat(51));  // 文字数制限オーバー
    await page.fill('input[name="items.0.quantity"]', '0');         // 1未満
    await page.fill('input[name="items.0.unitPrice"]', '-1');       // 負の値

    await page.click('button[type="submit"]');

    // エラーメッセージの確認
    await expect(page.locator('text="品目名は50文字以内で入力してください"')).toBeVisible();
    await expect(page.locator('text="数量は1以上を入力してください"')).toBeVisible();
    await expect(page.locator('text="単価は0以上を入力してください"')).toBeVisible();
  });

  test('パフォーマンス要件', async ({ page }) => {
    // 1. 初期表示時間の計測
    const startTime = Date.now();
    await page.goto('/purchase-orders/new');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // 2秒以内に読み込み完了

    // 2. 品目追加のレスポンス時間
    const addItemStartTime = Date.now();
    await page.click('button[aria-label="品目を追加"]');
    const addItemTime = Date.now() - addItemStartTime;
    expect(addItemTime).toBeLessThan(100); // 100ms以内

    // 3. 入力フィールドのレスポンス時間
    const inputStartTime = Date.now();
    await page.fill('input[name="items.0.unitPrice"]', '1000');
    const inputResponseTime = Date.now() - inputStartTime;
    expect(inputResponseTime).toBeLessThan(100); // 100ms以内

    // 4. バリデーション応答時間
    await page.click('button[aria-label="品目を追加"]');
    const validationStartTime = Date.now();
    await page.fill('input[name="items.1.quantity"]', '0');  // 不正な値
    await page.click('body');  // フォーカスを外してバリデーションをトリガー
    
    // バリデーションメッセージの表示を待つ
    await page.waitForSelector('text="数量は1以上を入力してください"');
    const validationTime = Date.now() - validationStartTime;
    expect(validationTime).toBeLessThan(200); // 200ms以内
  });

  test('大量データ入力時のパフォーマンス', async ({ page }) => {
    // リソース使用量の計測用関数
    const getResourceUsage = async () => {
      const stats = await page.evaluate(() => ({
        domNodes: document.getElementsByTagName('*').length,
        formElements: document.querySelectorAll('input, select, button').length
      }));
      return stats;
    };

    // 初期状態の計測
    const initialStats = await getResourceUsage();
    console.log('初期状態:', initialStats);

    // 50件の品目を追加
    for (let i = 0; i < 50; i++) {
      await page.click('button[aria-label="品目を追加"]');
      await page.fill(`input[name="items.${i}.itemName"]`, `テスト商品${i}`);
      await page.fill(`input[name="items.${i}.quantity"]`, '1');
      await page.fill(`input[name="items.${i}.unitPrice"]`, '1000');
      await page.selectOption(`select[name="items.${i}.taxRate"]`, '0.10');

      // 10件ごとにリソース使用量をチェック
      if ((i + 1) % 10 === 0) {
        const currentStats = await getResourceUsage();
        const domIncrease = currentStats.domNodes - initialStats.domNodes;
        const formElementsIncrease = currentStats.formElements - initialStats.formElements;
        
        console.log(`${i + 1}件目の状態:`, {
          domIncrease,
          formElementsIncrease,
          currentStats
        });
        
        // 要素数の増加が適切な範囲内であることを確認
        expect(domIncrease).toBeLessThan(1000);
        expect(formElementsIncrease).toBeLessThan(200);
      }
    }

    // スクロールとレンダリングのパフォーマンスを確認
    const scrollStartTime = Date.now();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrollTime = Date.now() - scrollStartTime;
    expect(scrollTime).toBeLessThan(100);

    // 最終的なリソース使用量をチェック
    const finalStats = await getResourceUsage();
    console.log('最終状態:', finalStats);
    
    const totalDomIncrease = finalStats.domNodes - initialStats.domNodes;
    const totalFormElementsIncrease = finalStats.formElements - initialStats.formElements;
    
    expect(totalDomIncrease).toBeLessThan(1000);
    expect(totalFormElementsIncrease).toBeLessThan(200);

    // 大量データ入力後のレスポンス時間確認
    const lastRowInputStartTime = Date.now();
    await page.fill(`input[name="items.49.unitPrice"]`, '2000');
    const lastRowInputTime = Date.now() - lastRowInputStartTime;
    expect(lastRowInputTime).toBeLessThan(100);
  });
}); 