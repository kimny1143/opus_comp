import { test as base, expect, Page, ConsoleMessage, Request, TestFixture } from '@playwright/test';
import { PrismaClient, InvoiceStatus } from '@prisma/client';
import { createMockInvoice, createTestUser, createMockVendor } from '../test/helpers/mockData';
import { 
  generateUniqueId, 
  generateTestEmail, 
  generateInvoiceNumber,
  waitForSelectorWithRetry,
  waitForResponseWithRetry
} from '@/utils/testHelpers';

const prisma = new PrismaClient();

// カスタムテストフィクスチャーの定義
interface CustomFixtures {
  page: Page;
}

const test = base.extend<CustomFixtures>({
  page: async ({ page }, use: (r: Page) => Promise<void>) => {
    // エラーイベントのハンドリング
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        console.error(`ブラウザコンソールエラー: ${msg.text()}`);
      }
    });

    page.on('pageerror', (error: Error) => {
      console.error(`ページエラー: ${error.message}`);
    });

    page.on('requestfailed', (request: Request) => {
      const failure = request.failure();
      console.error(`リクエスト失敗: ${request.url()} ${failure?.errorText ?? 'Unknown error'}`);
    });

    await use(page);
  },
});

// テスト実行時のタイムスタンプを生成（一意性の確保）
const TEST_RUN_ID = generateUniqueId();

// エラーハンドリング用のヘルパー関数
async function captureErrorState(page: Page, error: unknown, context: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${context}でエラーが発生:`, errorMessage);
  
  try {
    // スクリーンショットの保存（タイムスタンプ付き）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/${context.replace(/\s+/g, '-')}-${timestamp}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });

    // ネットワークトラフィックの記録
    const client = await page.context().newCDPSession(page);
    const networkLogs = await client.send('Network.getResponseBody');

    // DOMの状態とネットワーク情報を保存
    const html = await page.content();
    await prisma.testLog.create({
      data: {
        testId: TEST_RUN_ID,
        context,
        error: errorMessage,
        htmlSnapshot: html,
        networkLogs: JSON.stringify(networkLogs),
        timestamp: new Date(),
        screenshotPath
      }
    });

    // コンソールログの収集
    const consoleLogs = await page.evaluate(() => {
      return (window as any).consoleLog || [];
    });
    console.log(`コンソールログ:`, consoleLogs);

  } catch (captureError) {
    console.error('エラー状態の記録中にエラーが発生:', captureError);
  }
}

// 並列実行のための設定
test.describe.configure({ mode: 'parallel' });

test.describe('請求書管理フロー', () => {
  let page: Page;
  let testEmail: string;

  test.beforeAll(async () => {
    // テスト実行ごとに一意のメールアドレスを生成
    testEmail = generateTestEmail();

    // テストデータのクリーンアップを確実に実行
    await prisma.$transaction([
      prisma.invoice.deleteMany({
        where: {
          OR: [
            { invoiceNumber: { startsWith: 'TEST-' } },
            { invoiceNumber: { startsWith: 'SEARCH-TEST-' } }
          ]
        }
      }),
      prisma.user.deleteMany({
        where: {
          email: { endsWith: '@example.com' }
        }
      })
    ]);

    // テストユーザーを作成（一意性を確保）
    await createTestUser(testEmail);
  });

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    await test.step('サインインプロセス', async () => {
      try {
        // サインインページへの遷移前の状態を記録
        console.log('サインインページへの遷移開始');
        const initialUrl = page.url();
        
        // サインインページへの遷移とレスポンス待機を分離
        await page.goto('/auth/signin');
        await page.waitForURL('/auth/signin', { waitUntil: 'networkidle' });
        
        // APIレスポンスの完了を待機
        await page.waitForResponse(
          response => response.url().includes('/api/auth/csrf') && response.status() === 200
        );
        
        // フォームの表示を待機
        const form = await page.waitForSelector('form[data-testid="signin-form"]', {
          state: 'visible',
          timeout: 10000
        });
        expect(form).toBeTruthy();

        // 入力とサブミット
        await page.fill('[data-testid="email-input"]', testEmail);
        await page.waitForTimeout(100);
        
        await page.fill('[data-testid="password-input"]', 'password123');
        await page.waitForTimeout(100);
        
        const submitButton = await page.waitForSelector('[data-testid="signin-button"]:not([disabled])', {
          state: 'visible',
          timeout: 5000
        });

        // サインインとリダイレクトの完了を段階的に待機
        await submitButton.click();
        
        // サインインAPIのレスポンスを待機
        await page.waitForResponse(
          response => response.url().includes('/api/auth/signin') && response.status() === 200
        );
        
        // ダッシュボードへのリダイレクトを待機
        await page.waitForURL('/dashboard', { waitUntil: 'networkidle' });
        
        // 最終的なページ読み込みを待機
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('networkidle');
        
        // 遷移の成功を確認
        const finalUrl = page.url();
        console.log(`サインイン完了。初期URL: ${initialUrl} -> 最終URL: ${finalUrl}`);
        expect(finalUrl).toContain('/dashboard');

      } catch (error) {
        await captureErrorState(page, error, 'サインインプロセス');
        throw error;
      }
    });
  });

  test.afterEach(async () => {
    // 各テスト後のセッションクリーンアップ
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
  });

  test.afterAll(async () => {
    // テストデータの完全なクリーンアップ
    await prisma.$transaction([
      prisma.invoice.deleteMany({
        where: {
          OR: [
            { invoiceNumber: { startsWith: 'TEST-' } },
            { invoiceNumber: { startsWith: 'SEARCH-TEST-' } }
          ]
        }
      }),
      prisma.user.deleteMany({
        where: {
          email: { endsWith: '@example.com' }
        }
      })
    ]);
    await prisma.$disconnect();
  });

  test('請求書の作成から支払いまでの基本フロー', async () => {
    await test.step('請求書一覧ページへの遷移', async () => {
      try {
        // 遷移前の状態を記録
        const initialUrl = page.url();
        console.log(`請求書一覧への遷移開始。初期URL: ${initialUrl}`);

        // 遷移とレスポンス待機を段階的に実行
        await page.goto('/invoices');
        
        // URLの変更を待機
        await page.waitForURL('/invoices', { waitUntil: 'networkidle' });
        
        // 初期データ取得の完了を待機（リトライ付き）
        await Promise.all([
          waitForResponseWithRetry(page, '/api/invoices', 200),
          waitForResponseWithRetry(page, '/api/vendors', 200)
        ]);

        // DOMの更新完了を待機
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('networkidle');

        // リストコンポーネントの表示を待機（リトライ付き）
        await waitForSelectorWithRetry(page, '[data-testid="invoices-list"]', {
          timeout: 10000,
          maxRetries: 3
        });

        // 遷移の成功を確認
        const finalUrl = page.url();
        console.log(`請求書一覧への遷移完了。初期URL: ${initialUrl} -> 最終URL: ${finalUrl}`);
        expect(finalUrl).toContain('/invoices');

      } catch (error) {
        await captureErrorState(page, error, '請求書一覧ページ遷移');
        throw error;
      }
    });

    await test.step('新規請求書作成', async () => {
      try {
        // 作成ボタンの表示と有効化を待機（リトライ付き）
        await waitForSelectorWithRetry(page, '[data-testid="create-invoice-button"]:not([disabled])', {
          timeout: 10000,
          maxRetries: 3
        });

        // 遷移前の状態確認
        const currentUrl = page.url();
        console.log(`作成ページ遷移前のURL: ${currentUrl}`);

        // ボタンクリックと遷移
        await page.click('[data-testid="create-invoice-button"]');

        // 作成ページへの遷移を待機
        await page.waitForURL('/invoices/create', { waitUntil: 'networkidle' });

        // 初期データ取得の完了を待機（リトライ付き）
        await waitForResponseWithRetry(page, '/api/invoices/create', 200, {
          timeout: 10000,
          maxRetries: 3
        });

        // フォームの表示を確認（リトライ付き）
        await waitForSelectorWithRetry(page, '[data-testid="invoice-form"]', {
          timeout: 10000,
          maxRetries: 3
        });

        // 一意の請求書番号を生成
        const invoiceNumber = generateInvoiceNumber();
        
        // フォーム入力前の状態確認
        console.log('フォーム入力開始');
        
        // フォーム入力（各入力後に短い待機を入れる）
        await page.fill('[data-testid="invoice-number-input"]', invoiceNumber);
        await page.waitForTimeout(100);
        
        await page.fill('[data-testid="amount-input"]', '100000');
        await page.waitForTimeout(100);
        
        await page.fill('[data-testid="tax-rate-input"]', '10');
        await page.waitForTimeout(100);
        
        await page.selectOption('[data-testid="status-select"]', 'DRAFT');
        await page.waitForTimeout(100);

        // 送信ボタンの有効化を待機
        const submitButton = await page.waitForSelector('[data-testid="submit-button"]:not([disabled])', {
          state: 'visible',
          timeout: 5000
        });

        console.log('フォーム送信開始');

        // フォーム送信と完了待機
        await submitButton.click();

        // 保存APIの完了を待機
        await page.waitForResponse(
          response => response.url().includes('/api/invoices') && response.status() === 201
        );

        // 詳細ページへの遷移を待機
        await page.waitForURL(/\/invoices\/\d+/, { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');

        // 作成後の状態確認
        const statusBadge = await page.waitForSelector('[data-testid="status-badge-DRAFT"]', {
          state: 'visible',
          timeout: 10000
        });
        expect(statusBadge).toBeTruthy();

        const createdUrl = page.url();
        console.log(`請求書作成完了。URL: ${createdUrl}`);

      } catch (error) {
        console.error('請求書作成中のエラー:', error);
        await captureErrorState(page, error, '新規請求書作成');
        throw error;
      }
    });

    await test.step('金額の確認', async () => {
      try {
        // APIレスポンスとDOM更新の完了を待機
        await Promise.all([
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          ),
          page.waitForLoadState('networkidle')
        ]);

        // 各金額要素の表示を待機
        const [subtotal, tax, total] = await Promise.all([
          page.waitForSelector('[data-testid="subtotal-amount"]', {
            state: 'visible',
            timeout: 5000
          }),
          page.waitForSelector('[data-testid="tax-amount"]', {
            state: 'visible',
            timeout: 5000
          }),
          page.waitForSelector('[data-testid="total-amount"]', {
            state: 'visible',
            timeout: 5000
          })
        ]);

        // 金額の検証（より厳密な数値チェック）
        const subtotalValue = await subtotal.textContent();
        const taxValue = await tax.textContent();
        const totalValue = await total.textContent();

        expect(subtotalValue).toMatch(/^¥?100,000$/);
        expect(taxValue).toMatch(/^¥?10,000$/);
        expect(totalValue).toMatch(/^¥?110,000$/);

      } catch (error) {
        await page.screenshot({ 
          path: `test-results/amount-verification-error-${Date.now()}.png`,
          fullPage: true 
        });
        throw error;
      }
    });

    await test.step('ステータス変更', async () => {
      try {
        // ステータス変更ボタンが操作可能になるのを待機
        const changeStatusButton = await page.waitForSelector('[data-testid="change-status-button"]:not([disabled])', {
          state: 'visible',
          timeout: 5000
        });

        // モーダルの表示とネットワーク完了を同時に待機
        await Promise.all([
          changeStatusButton.click(),
          page.waitForSelector('[data-testid="status-change-modal"]', {
            state: 'visible',
            timeout: 5000
          }),
          page.waitForLoadState('networkidle')
        ]);

        // モーダル内の要素が操作可能になるのを待機
        await page.waitForSelector('[data-testid="status-select"]:not([disabled])', {
          state: 'visible',
          timeout: 5000
        });

        // ステータス選択とAPIリクエストの完了を待機
        await Promise.all([
          page.selectOption('[data-testid="status-select"]', 'PENDING'),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          )
        ]);
        
        // 更新ボタンのクリックとステータス更新の完了を待機
        const updateButton = await page.waitForSelector('[data-testid="update-status-button"]:not([disabled])', {
          state: 'visible',
          timeout: 5000
        });

        await Promise.all([
          updateButton.click(),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices/status') && 
            response.status() === 200
          ),
          page.waitForLoadState('networkidle')
        ]);

        // 新しいステータスの表示を確認（より厳密なチェック）
        const newStatusBadge = await page.waitForSelector('[data-testid="status-badge-PENDING"]', {
          state: 'visible',
          timeout: 10000
        });
        
        const statusText = await newStatusBadge.textContent();
        expect(statusText).toMatch(/PENDING/i);

      } catch (error) {
        await page.screenshot({ 
          path: `test-results/status-change-error-${Date.now()}.png`,
          fullPage: true 
        });
        throw error;
      }
    });
  });

  test('期限切れ請求書の自動ステータス更新', async () => {
    await test.step('境界値での期限切れ確認', async () => {
      try {
        // 23:59に期限が設定された請求書を作成
        const today = new Date();
        const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        const borderlineInvoice = await createMockInvoice({
          dueDate,
          status: InvoiceStatus.PENDING,
          invoiceNumber: generateInvoiceNumber('BORDERLINE')
        });

        expect(borderlineInvoice).toBeTruthy();
        expect(borderlineInvoice.status).toBe(InvoiceStatus.PENDING);
        
        // システム日時を期限直前に設定
        const beforeDue = new Date(dueDate.getTime() - 1000); // 1秒前
        await page.evaluate((time) => {
          Date.now = () => time;
        }, beforeDue.getTime());

        // 一覧ページで確認
        await Promise.all([
          page.goto('/invoices', { waitUntil: 'networkidle' }),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          )
        ]);

        // PENDINGステータスの確認
        const pendingStatus = await page.waitForSelector(`[data-testid="status-badge-PENDING"]`, {
          state: 'visible',
          timeout: 5000
        });
        expect(pendingStatus).toBeTruthy();

        // システム日時を期限後に設定
        const afterDue = new Date(dueDate.getTime() + 1000); // 1秒後
        await page.evaluate((time) => {
          Date.now = () => time;
        }, afterDue.getTime());

        // ページをリロード
        await Promise.all([
          page.reload(),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          )
        ]);

        // OVERDUEステータスの確認
        const overdueStatus = await page.waitForSelector(`[data-testid="status-badge-OVERDUE"]`, {
          state: 'visible',
          timeout: 5000
        });
        expect(overdueStatus).toBeTruthy();

      } catch (error) {
        await captureErrorState(page, error, '境界値での期限切れ確認');
        throw error;
      }
    });

    await test.step('タイムゾーン考慮の期限切れ確認', async () => {
      try {
        // UTC+0での期限日時を設定
        const utcDate = new Date();
        utcDate.setUTCHours(0, 0, 0, 0);
        
        const tzInvoice = await createMockInvoice({
          dueDate: utcDate,
          status: InvoiceStatus.PENDING,
          invoiceNumber: generateInvoiceNumber('TZ-TEST')
        });

        expect(tzInvoice).toBeTruthy();
        expect(tzInvoice.status).toBe(InvoiceStatus.PENDING);

        // UTC+9でのシステム日時を設定（期限切れになるはず）
        const jstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
        await page.evaluate((time) => {
          Date.now = () => time;
        }, jstDate.getTime());

        // 一覧ページで確認
        await Promise.all([
          page.goto('/invoices', { waitUntil: 'networkidle' }),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          )
        ]);

        // OVERDUEステータスの確認
        const overdueStatus = await page.waitForSelector(`[data-testid="status-badge-OVERDUE"]`, {
          state: 'visible',
          timeout: 5000
        });
        expect(overdueStatus).toBeTruthy();

      } catch (error) {
        await captureErrorState(page, error, 'タイムゾーン考慮の期限切れ確認');
        throw error;
      }
    });

    await test.step('PAID→OVERDUE遷移の制御確認', async () => {
      try {
        // 期限切れのPAID請求書を作成
        const paidInvoice = await createMockInvoice({
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: InvoiceStatus.PAID,
          invoiceNumber: generateInvoiceNumber('PAID-TEST')
        });

        expect(paidInvoice).toBeTruthy();
        expect(paidInvoice.status).toBe(InvoiceStatus.PAID);
        expect(paidInvoice.dueDate.getTime()).toBeLessThan(Date.now());

        // 一覧ページで確認
        await Promise.all([
          page.goto('/invoices', { waitUntil: 'networkidle' }),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          )
        ]);

        // PAIDステータスが維持されていることを確認
        const paidStatus = await page.waitForSelector(`[data-testid="status-badge-PAID"]`, {
          state: 'visible',
          timeout: 5000
        });
        expect(paidStatus).toBeTruthy();

        // OVERDUEステータスが存在しないことを確認
        const overdueExists = await page.locator(`[data-testid="status-badge-OVERDUE"]`).count();
        expect(overdueExists).toBe(0);

      } catch (error) {
        await captureErrorState(page, error, 'PAID→OVERDUE遷移の制御確認');
        throw error;
      }
    });
  });

  // 新規テストケースの追加
  test('複数の請求書の一括処理', async () => {
    await test.step('複数の請求書作成', async () => {
      try {
        // 3つの請求書を作成
        const invoices = await Promise.all([
          createMockInvoice({ status: InvoiceStatus.DRAFT }),
          createMockInvoice({ status: InvoiceStatus.PENDING }),
          createMockInvoice({ status: InvoiceStatus.PAID })
        ]);

        expect(invoices).toHaveLength(3);
        expect(invoices.map(inv => inv.status)).toEqual([
          InvoiceStatus.DRAFT,
          InvoiceStatus.PENDING,
          InvoiceStatus.PAID
        ]);

      } catch (error) {
        console.error('複数請求書の作成に失敗:', error);
        throw error;
      }
    });

    await test.step('一覧表示の確認', async () => {
      try {
        await Promise.all([
          page.goto('/invoices', { waitUntil: 'networkidle' }),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          )
        ]);

        // ステータスごとの請求書数を確認
        const draftCount = await page.locator('[data-testid="status-badge-DRAFT"]').count();
        const pendingCount = await page.locator('[data-testid="status-badge-PENDING"]').count();
        const paidCount = await page.locator('[data-testid="status-badge-PAID"]').count();

        expect(draftCount).toBeGreaterThanOrEqual(1);
        expect(pendingCount).toBeGreaterThanOrEqual(1);
        expect(paidCount).toBeGreaterThanOrEqual(1);

      } catch (error) {
        await page.screenshot({ 
          path: `test-results/invoice-list-multiple-error-${Date.now()}.png`,
          fullPage: true 
        });
        throw error;
      }
    });

    await test.step('フィルタリング機能の確認', async () => {
      try {
        // ステータスフィルターの操作
        await page.selectOption('[data-testid="status-filter"]', 'PENDING');
        
        await Promise.all([
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          ),
          page.waitForLoadState('networkidle')
        ]);

        // フィルター結果の確認
        const visibleStatuses = await page.locator('[data-testid^="status-badge-"]').allTextContents();
        expect(visibleStatuses.every(status => status.includes('PENDING'))).toBeTruthy();

      } catch (error) {
        await page.screenshot({ 
          path: `test-results/filter-error-${Date.now()}.png`,
          fullPage: true 
        });
        throw error;
      }
    });
  });

  test('請求書の検索と並び替え', async () => {
    await test.step('検索機能の確認', async () => {
      try {
        // テスト用のベンダーと請求書を作成
        const vendor = await createMockVendor({ name: `TestVendor-${generateUniqueId()}` });
        const searchInvoice = await createMockInvoice({ 
          vendorId: vendor.id,
          invoiceNumber: generateInvoiceNumber('SEARCH-TEST')
        });

        await Promise.all([
          page.goto('/invoices', { waitUntil: 'networkidle' }),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          )
        ]);

        // 検索の実行
        await page.fill('[data-testid="search-input"]', 'TestVendor123');
        await Promise.all([
          page.keyboard.press('Enter'),
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          )
        ]);

        // 検索結果の確認
        const searchResults = await page.locator('[data-testid="vendor-name"]').allTextContents();
        expect(searchResults.some(text => text.includes('TestVendor123'))).toBeTruthy();

      } catch (error) {
        await captureErrorState(page, error, '検索機能の確認');
        throw error;
      }
    });

    await test.step('並び替え機能の確認', async () => {
      try {
        // 金額での並び替え
        await page.click('[data-testid="sort-amount"]');
        await Promise.all([
          page.waitForResponse(response => 
            response.url().includes('/api/invoices') && 
            response.status() === 200
          ),
          page.waitForLoadState('networkidle')
        ]);

        // 金額の順序を確認
        const amounts = await page.locator('[data-testid="invoice-amount"]')
          .allTextContents()
          .then(texts => texts.map(text => 
            parseInt(text.replace(/[^0-9]/g, ''))
          ));

        // 昇順になっていることを確認
        const isSorted = amounts.every((amount, index) => 
          index === 0 || amount >= amounts[index - 1]
        );
        expect(isSorted).toBeTruthy();

      } catch (error) {
        await page.screenshot({ 
          path: `test-results/sort-error-${Date.now()}.png`,
          fullPage: true 
        });
        throw error;
      }
    });
  });

  test('大量データ時のパフォーマンス', async () => {
    await test.step('大量の請求書作成', async () => {
      try {
        // 100件の請求書を作成
        const invoices = await Promise.all(
          Array.from({ length: 100 }, (_, index) => 
            createMockInvoice({
              status: index % 2 === 0 ? InvoiceStatus.PENDING : InvoiceStatus.PAID,
              invoiceNumber: generateInvoiceNumber(`PERF-TEST-${index + 1}`)
            })
          )
        );

        expect(invoices).toHaveLength(100);
        console.log(`${invoices.length}件の請求書を作成完了`);

      } catch (error) {
        await captureErrorState(page, error, '大量データ作成');
        throw error;
      }
    });

    await test.step('一覧表示の読み込み時間計測', async () => {
      try {
        // パフォーマンス計測開始
        const startTime = Date.now();

        // 一覧ページへの遷移とデータ読み込み
        await Promise.all([
          page.goto('/invoices', { waitUntil: 'networkidle' }),
          waitForResponseWithRetry(page, '/api/invoices', 200, {
            timeout: 30000, // 大量データ対応のため長めのタイムアウト
            maxRetries: 5
          })
        ]);

        // 全ての請求書が表示されるまで待機
        await waitForSelectorWithRetry(page, '[data-testid="invoices-list"]', {
          timeout: 30000,
          maxRetries: 5
        });

        const loadTime = Date.now() - startTime;
        console.log(`一覧表示の読み込み時間: ${loadTime}ms`);

        // 読み込み時間が10秒を超えないことを確認
        expect(loadTime).toBeLessThan(10000);

        // 表示された請求書数の確認
        const invoiceCount = await page.locator('[data-testid^="invoice-row-"]').count();
        expect(invoiceCount).toBe(100);

      } catch (error) {
        await captureErrorState(page, error, 'パフォーマンス計測');
        throw error;
      }
    });

    await test.step('フィルタリングとソートの応答時間計測', async () => {
      try {
        // フィルター操作の応答時間計測
        const filterStartTime = Date.now();
        await page.selectOption('[data-testid="status-filter"]', 'PENDING');
        await waitForResponseWithRetry(page, '/api/invoices', 200);
        const filterTime = Date.now() - filterStartTime;
        console.log(`フィルター操作の応答時間: ${filterTime}ms`);
        expect(filterTime).toBeLessThan(3000);

        // フィルター結果の件数確認
        const pendingCount = await page.locator('[data-testid="status-badge-PENDING"]').count();
        expect(pendingCount).toBe(50); // 偶数インデックスの請求書がPENDING

        // ソート操作の応答時間計測
        const sortStartTime = Date.now();
        await page.click('[data-testid="sort-amount"]');
        await waitForResponseWithRetry(page, '/api/invoices', 200);
        const sortTime = Date.now() - sortStartTime;
        console.log(`ソート操作の応答時間: ${sortTime}ms`);
        expect(sortTime).toBeLessThan(3000);

      } catch (error) {
        await captureErrorState(page, error, 'フィルター・ソート操作');
        throw error;
      }
    });

    await test.step('スクロールパフォーマンスの計測', async () => {
      try {
        // 全件表示に戻す
        await page.selectOption('[data-testid="status-filter"]', '');
        await waitForResponseWithRetry(page, '/api/invoices', 200);

        // スクロール操作の応答時間計測
        const scrollStartTime = Date.now();
        
        // ページ最下部までスクロール
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // スクロール後の表示確認
        await waitForSelectorWithRetry(page, '[data-testid^="invoice-row-"]:last-child', {
          timeout: 5000,
          maxRetries: 3
        });

        const scrollTime = Date.now() - scrollStartTime;
        console.log(`スクロール操作の応答時間: ${scrollTime}ms`);
        expect(scrollTime).toBeLessThan(1000);

      } catch (error) {
        await captureErrorState(page, error, 'スクロールパフォーマンス');
        throw error;
      }
    });
  });
}); 