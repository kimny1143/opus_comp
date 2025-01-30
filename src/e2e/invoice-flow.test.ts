import { test as base, expect, Page, ConsoleMessage, Request, TestFixture } from '@playwright/test';
import { PrismaClient, InvoiceStatus, User, VendorCategory } from '@prisma/client';
import { createMockInvoice, createTestUser, createMockVendor } from '../test/helpers/mockData';
import { 
  generateUniqueId, 
  generateTestEmail, 
  generateInvoiceNumber,
  waitForSelectorWithRetry,
  waitForResponseWithRetry
} from '@/utils/testHelpers';
import { addDays, isOverdue } from '@/lib/utils/date';

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
async function captureErrorState(page: Page, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/サインインプロセス-${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.error('エラー状態の記録:', errorMessage);
  } catch (e) {
    console.error('エラー状態の記録中にエラーが発生:', e);
  }
}

// 並列実行の設定を有効化
test.describe.configure({ mode: 'parallel' });

// 基本機能のテストグループ
test.describe('基本機能テスト', () => {
  test.beforeEach(async ({ page: testPage }) => {
    // ... existing beforeEach code ...
  });

  test('請求書の作成から支払いまでの基本フロー', async () => {
    // ... existing test code ...
  });
});

// バリデーションのテストグループ
test.describe('バリデーションテスト', () => {
  test.beforeEach(async ({ page: testPage }) => {
    // ... existing beforeEach code ...
  });

  test('バリデーションエラーの確認', async () => {
    // ... existing test code ...
  });
});

// ステータス管理のテストグループ
test.describe('ステータス管理テスト', () => {
  test.beforeEach(async ({ page: testPage }) => {
    // ... existing beforeEach code ...
  });

  test('期限切れ請求書の自動ステータス更新', async () => {
    // ... existing test code ...
  });
});

// 一括処理のテストグループ
test.describe('一括処理テスト', () => {
  test.beforeEach(async ({ page: testPage }) => {
    // ... existing beforeEach code ...
  });

  test('複数の請求書の一括処理', async () => {
    // ... existing test code ...
  });
});

// 検索・並び替えのテストグループ
test.describe('検索・並び替えテスト', () => {
  test.beforeEach(async ({ page: testPage }) => {
    // ... existing beforeEach code ...
  });

  test('請求書の検索と並び替え', async () => {
    // ... existing test code ...
  });
});

// パフォーマンステストグループ
test.describe('パフォーマンステスト', () => {
  test.beforeEach(async ({ page: testPage }) => {
    // ... existing beforeEach code ...
  });

  test('大量データ時のパフォーマンス', async () => {
    // ... existing test code ...
  });
});

// 日付関連のテストグループ
test.describe('日付バリデーションテスト', () => {
  test('発行日が未来の場合はエラーになる', async ({ page }) => {
    const testEmail = generateTestEmail();
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail);

    // 未来の日付で請求書を作成
    const futureDate = addDays(new Date(), 7);
    const invoice = await createMockInvoice({
      status: InvoiceStatus.DRAFT,
      issueDate: futureDate,
      dueDate: addDays(futureDate, 30),
      vendorId: vendor.id
    });

    // 請求書編集ページに移動
    await page.goto(`/invoices/${invoice.id}/edit`);

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // エラーメッセージを確認
    const errorMessage = await page.getByText('発行日は今日以前の日付を指定してください');
    await expect(errorMessage).toBeVisible();
  });

  test('支払期限が発行日より前の場合はエラーになる', async ({ page }) => {
    const testEmail = generateTestEmail();
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail);

    // 発行日より前の支払期限で請求書を作成
    const issueDate = new Date();
    const dueDate = addDays(issueDate, -1);
    const invoice = await createMockInvoice({
      status: InvoiceStatus.DRAFT,
      issueDate,
      dueDate,
      vendorId: vendor.id
    }, testEmail);

    // 請求書編集ページに移動
    await page.goto(`/invoices/${invoice.id}/edit`);

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // エラーメッセージを確認
    const errorMessage = await page.getByText('支払期限は発行日以降の日付を指定してください');
    await expect(errorMessage).toBeVisible();
  });
});

// ステータス遷移のテストグループ
test.describe('ステータス遷移テスト', () => {
  test('DRAFTからPENDINGへの遷移が許可される', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 下書き状態の請求書を作成
    const invoice = await createMockInvoice({
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書詳細ページに移動
    await page.goto(`/invoices/${invoice.id}`)

    // ステータスを「保留中」に変更
    await page.getByRole('button', { name: 'ステータス変更' }).click()
    await page.getByRole('menuitem', { name: '保留中' }).click()

    // 確認ダイアログで「はい」をクリック
    await page.getByRole('button', { name: 'はい' }).click()

    // ステータスが更新されたことを確認
    const statusCell = await page.getByTestId(`invoice-status-${invoice.id}`)
    await expect(statusCell).toHaveText('保留中')
  })

  test('DRAFTからREVIEWINGへの直接遷移が禁止される', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 下書き状態の請求書を作成
    const invoice = await createMockInvoice({
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書詳細ページに移動
    await page.goto(`/invoices/${invoice.id}`)

    // ステータス変更ボタンをクリック
    await page.getByRole('button', { name: 'ステータス変更' }).click()

    // 「確認中」メニュー項目が無効化されていることを確認
    const reviewingMenuItem = await page.getByRole('menuitem', { name: '確認中' })
    await expect(reviewingMenuItem).toBeDisabled()
  })

  test('PENDINGからREVIEWINGへの遷移が許可される', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 保留中状態の請求書を作成
    const invoice = await createMockInvoice({
      status: InvoiceStatus.PENDING,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書詳細ページに移動
    await page.goto(`/invoices/${invoice.id}`)

    // ステータスを「確認中」に変更
    await page.getByRole('button', { name: 'ステータス変更' }).click()
    await page.getByRole('menuitem', { name: '確認中' }).click()

    // 確認ダイアログで「はい」をクリック
    await page.getByRole('button', { name: 'はい' }).click()

    // ステータスが更新されたことを確認
    const statusCell = await page.getByTestId(`invoice-status-${invoice.id}`)
    await expect(statusCell).toHaveText('確認中')
  })

  test('PAIDからの状態変更が禁止される', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 支払済み状態の請求書を作成
    const invoice = await createMockInvoice({
      status: InvoiceStatus.PAID,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書詳細ページに移動
    await page.goto(`/invoices/${invoice.id}`)

    // ステータス変更ボタンが無効化されていることを確認
    const statusButton = await page.getByRole('button', { name: 'ステータス変更' })
    await expect(statusButton).toBeDisabled()

    // エラーメッセージを確認
    const errorMessage = await page.getByText('支払済みの請求書のステータスは変更できません')
    await expect(errorMessage).toBeVisible()
  })

  test('REJECTEDからDRAFTへの遷移が許可される', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 却下状態の請求書を作成
    const invoice = await createMockInvoice({
      status: InvoiceStatus.REJECTED,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書詳細ページに移動
    await page.goto(`/invoices/${invoice.id}`)

    // ステータスを「下書き」に変更
    await page.getByRole('button', { name: 'ステータス変更' }).click()
    await page.getByRole('menuitem', { name: '下書き' }).click()

    // 確認ダイアログで「はい」をクリック
    await page.getByRole('button', { name: 'はい' }).click()

    // ステータスが更新されたことを確認
    const statusCell = await page.getByTestId(`invoice-status-${invoice.id}`)
    await expect(statusCell).toHaveText('下書き')
  })
})

// 自動ステータス更新のテストグループ
test.describe('自動ステータス更新テスト', () => {
  test('期限切れの請求書が自動的にOVERDUEになる', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 期限切れの請求書を作成（30日前の期限）
    const invoice = await createMockInvoice({
      status: InvoiceStatus.PENDING,
      issueDate: addDays(new Date(), -60),
      dueDate: addDays(new Date(), -30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書一覧ページに移動
    await page.goto('/invoices')

    // ステータスが自動的にOVERDUEに更新されていることを確認
    const statusCell = await page.getByTestId(`invoice-status-${invoice.id}`)
    await expect(statusCell).toHaveText('期限超過')

    // 警告アイコンが表示されていることを確認
    const warningIcon = await page.getByTestId(`warning-icon-${invoice.id}`)
    await expect(warningIcon).toBeVisible()
  })

  test('期限が近い請求書に警告が表示される', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 期限が近い請求書を作成（5日後が期限）
    const invoice = await createMockInvoice({
      status: InvoiceStatus.PENDING,
      issueDate: addDays(new Date(), -25),
      dueDate: addDays(new Date(), 5),
      vendorId: vendor.id
    }, testEmail)

    // 請求書一覧ページに移動
    await page.goto('/invoices')

    // 警告アイコンが表示されていることを確認
    const warningIcon = await page.getByTestId(`warning-icon-${invoice.id}`)
    await expect(warningIcon).toBeVisible()

    // 警告メッセージが表示されていることを確認
    const warningMessage = await page.getByText('支払期限が近づいています')
    await expect(warningMessage).toBeVisible()
  })
})

// 境界値テストのグループ
test.describe('境界値テスト', () => {
  test('金額の境界値チェック', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 請求書の作成
    const invoice = await createMockInvoice({
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書編集ページに移動
    await page.goto(`/invoices/${invoice.id}/edit`)

    // 最大金額のテスト（999,999,999円）
    await page.getByLabel('単価').fill('999999999')
    await page.getByLabel('数量').fill('1')
    await page.getByRole('button', { name: '保存' }).click()
    // 保存が成功することを確認
    await expect(page.getByText('保存しました')).toBeVisible()

    // 最大金額を超える値のテスト（1,000,000,000円）
    await page.getByLabel('単価').fill('1000000000')
    await page.getByRole('button', { name: '保存' }).click()
    // エラーメッセージを確認
    await expect(page.getByText('999999999以下の値を入力してください')).toBeVisible()

    // 負の金額のテスト
    await page.getByLabel('単価').fill('-1000')
    await page.getByRole('button', { name: '保存' }).click()
    // エラーメッセージを確認
    await expect(page.getByText('0より大きい値を入力してください')).toBeVisible()

    // 小数点を含む金額のテスト
    await page.getByLabel('単価').fill('1000.5')
    await page.getByRole('button', { name: '保存' }).click()
    // エラーメッセージを確認
    await expect(page.getByText('整数を入力してください')).toBeVisible()
  })

  test('税率の境界値チェック', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 請求書の作成
    const invoice = await createMockInvoice({
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書編集ページに移動
    await page.goto(`/invoices/${invoice.id}/edit`)

    // 最小税率のテスト（8%）
    await page.getByLabel('税率').fill('8')
    await page.getByRole('button', { name: '保存' }).click()
    // 保存が成功することを確認
    await expect(page.getByText('保存しました')).toBeVisible()

    // 最大税率のテスト（10%）
    await page.getByLabel('税率').fill('10')
    await page.getByRole('button', { name: '保存' }).click()
    // 保存が成功することを確認
    await expect(page.getByText('保存しました')).toBeVisible()

    // 範囲外の税率のテスト（7%）
    await page.getByLabel('税率').fill('7')
    await page.getByRole('button', { name: '保存' }).click()
    // エラーメッセージを確認
    await expect(page.getByText('税率は8%以上を入力してください')).toBeVisible()

    // 範囲外の税率のテスト（11%）
    await page.getByLabel('税率').fill('11')
    await page.getByRole('button', { name: '保存' }).click()
    // エラーメッセージを確認
    await expect(page.getByText('税率は10%以下を入力してください')).toBeVisible()
  })

  test('日付の境界値チェック', async ({ page }) => {
    // テストユーザーとベンダーを作成
    const testEmail = generateTestEmail()
    const vendor = await createMockVendor({
      name: 'Test Vendor',
      category: VendorCategory.CORPORATION,
    }, testEmail)

    // 請求書の作成
    const invoice = await createMockInvoice({
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      vendorId: vendor.id
    }, testEmail)

    // 請求書編集ページに移動
    await page.goto(`/invoices/${invoice.id}/edit`)

    // 過去の発行日（1年前）のテスト
    const oneYearAgo = addDays(new Date(), -365)
    await page.getByLabel('発行日').fill(oneYearAgo.toISOString().split('T')[0])
    await page.getByRole('button', { name: '保存' }).click()
    // 保存が成功することを確認
    await expect(page.getByText('保存しました')).toBeVisible()

    // 未来の発行日のテスト
    const futureDate = addDays(new Date(), 1)
    await page.getByLabel('発行日').fill(futureDate.toISOString().split('T')[0])
    await page.getByRole('button', { name: '保存' }).click()
    // エラーメッセージを確認
    await expect(page.getByText('発行日は今日以前の日付を指定してください')).toBeVisible()

    // 発行日より前の支払期限のテスト
    const currentDate = new Date()
    await page.getByLabel('発行日').fill(currentDate.toISOString().split('T')[0])
    const earlierDueDate = addDays(currentDate, -1)
    await page.getByLabel('支払期限').fill(earlierDueDate.toISOString().split('T')[0])
    await page.getByRole('button', { name: '保存' }).click()
    // エラーメッセージを確認
    await expect(page.getByText('支払期限は発行日以降の日付を指定してください')).toBeVisible()

    // 発行日から1年後の支払期限のテスト
    const oneYearLater = addDays(currentDate, 365)
    await page.getByLabel('支払期限').fill(oneYearLater.toISOString().split('T')[0])
    await page.getByRole('button', { name: '保存' }).click()
    // 保存が成功することを確認
    await expect(page.getByText('保存しました')).toBeVisible()
  })
})

// ... existing code ...