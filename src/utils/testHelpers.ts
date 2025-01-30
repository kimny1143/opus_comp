import { randomBytes } from 'crypto';
import { Page } from '@playwright/test';

/**
 * テスト実行時の一意のIDを生成するユーティリティ関数
 * @param prefix - 生成されるIDのプレフィックス（オプション）
 * @returns {string} 一意のID
 */
export const generateUniqueId = (prefix?: string): string => {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, -1); // ミリ秒まで含める
  const random = randomBytes(8).toString('hex');
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * テストメールアドレスを生成する関数
 * @param domain - メールアドレスのドメイン（デフォルト: example.com）
 * @returns {string} テスト用メールアドレス
 */
export const generateTestEmail = (domain: string = 'example.com'): string => {
  const uniqueId = generateUniqueId('test');
  return `${uniqueId}@${domain}`;
};

/**
 * テスト用請求書番号を生成する関数
 * @param prefix - 請求書番号のプレフィックス（デフォルト: TEST）
 * @returns {string} テスト用請求書番号
 */
export const generateInvoiceNumber = (prefix: string = 'TEST'): string => {
  const uniqueId = generateUniqueId();
  return `${prefix}-${uniqueId}`;
};

/**
 * リトライ可能な操作を実行する関数
 * @param operation - 実行する操作
 * @param maxRetries - 最大リトライ回数
 * @param delayMs - リトライ間のディレイ（ミリ秒）
 * @returns 操作の結果
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      if (attempt === maxRetries) break;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`操作が失敗しました（${attempt}/${maxRetries}）: ${errorMessage}`);
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  const finalErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`最大リトライ回数（${maxRetries}回）を超えました: ${finalErrorMessage}`);
};

/**
 * セレクタが表示されるまで待機する関数（リトライ付き）
 * @param page - Playwrightのページオブジェクト
 * @param selector - 待機対象のセレクタ
 * @param options - 待機オプション
 */
export const waitForSelectorWithRetry = async (
  page: Page,
  selector: string,
  options: {
    state?: 'visible' | 'hidden' | 'attached' | 'detached';
    timeout?: number;
    maxRetries?: number;
    delayMs?: number;
  } = {}
): Promise<void> => {
  const {
    state = 'visible',
    timeout = 5000,
    maxRetries = 3,
    delayMs = 1000
  } = options;

  await withRetry(
    async () => {
      await page.waitForSelector(selector, { state, timeout });
    },
    maxRetries,
    delayMs
  );
};

/**
 * APIレスポンスを待機する関数（リトライ付き）
 * @param page - Playwrightのページオブジェクト
 * @param urlPattern - 待機対象のURLパターン
 * @param expectedStatus - 期待するステータスコード
 * @param options - 待機オプション
 */
export const waitForResponseWithRetry = async (
  page: Page,
  urlPattern: string | RegExp,
  expectedStatus: number = 200,
  options: {
    timeout?: number;
    maxRetries?: number;
    delayMs?: number;
  } = {}
): Promise<void> => {
  const {
    timeout = 5000,
    maxRetries = 3,
    delayMs = 1000
  } = options;

  await withRetry(
    async () => {
      await page.waitForResponse(
        response => 
          response.url().match(urlPattern) !== null && 
          response.status() === expectedStatus,
        { timeout }
      );
    },
    maxRetries,
    delayMs
  );
};

/**
 * 認証プロセスを待機する関数（リトライ付き）
 * @param page - Playwrightのページオブジェクト
 * @param options - 待機オプション
 */
export const waitForAuthentication = async (
  page: Page,
  options: {
    timeout?: number;
    maxRetries?: number;
    delayMs?: number;
  } = {}
): Promise<void> => {
  const {
    timeout = 10000,
    maxRetries = 5,
    delayMs = 2000
  } = options;

  await withRetry(
    async () => {
      // セッションクッキーの確認
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => 
        c.name.includes('next-auth.session-token')
      );

      if (!sessionCookie) {
        console.log('セッションクッキーチェック:', {
          allCookies: cookies.map(c => ({
            name: c.name,
            domain: c.domain,
            path: c.path
          })),
          timestamp: new Date().toISOString()
        });
        throw new Error('セッションクッキーが見つかりません');
      }

      // ダッシュボードへのリダイレクトを確認
      const currentUrl = page.url();
      if (!currentUrl.includes('/dashboard')) {
        throw new Error(`予期しないURL: ${currentUrl}`);
      }

      console.log('認証成功:', {
        url: currentUrl,
        sessionCookie: {
          name: sessionCookie.name,
          domain: sessionCookie.domain,
          path: sessionCookie.path,
          secure: sessionCookie.secure,
          httpOnly: sessionCookie.httpOnly
        },
        timestamp: new Date().toISOString()
      });
    },
    maxRetries,
    delayMs
  );
};

/**
 * 認証エラー状態をキャプチャする関数
 * @param page - Playwrightのページオブジェクト
 * @param error - エラーオブジェクト
 */
export const captureAuthError = async (
  page: Page,
  error: unknown
): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const errorMessage = error instanceof Error ? error.message : String(error);

  // スクリーンショットの保存
  await page.screenshot({
    path: `test-results/auth-error-${timestamp}.png`,
    fullPage: true
  });

  // クッキー情報の記録
  const cookies = await page.context().cookies();
  console.error('認証エラー:', {
    message: errorMessage,
    url: page.url(),
    cookies: cookies.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path
    })),
    timestamp: new Date().toISOString()
  });

  // ブラウザコンソールログの取得
  const consoleLogs = await page.evaluate(() => {
    // @ts-ignore
    return window.consoleLog || [];
  });
  
  console.error('ブラウザコンソールログ:', {
    logs: consoleLogs,
    timestamp: new Date().toISOString()
  });
};
