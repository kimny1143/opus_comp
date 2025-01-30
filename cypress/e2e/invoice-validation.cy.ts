import { format } from 'date-fns';
import { INVOICE_STATUS, TAX_RATES } from '../../src/types/validation/invoiceSchema';
import {
  createTestInvoice,
  createTestVendor,
  assertErrorMessage,
  assertTaxCalculation,
  assertPagination
} from '../support/helpers';

// Cypressのカスタムコマンドの型定義を拡張
declare global {
  namespace Cypress {
    interface Chainable {
      login(options?: { role: string }): void;
    }
  }
}

describe('インボイス制度対応テスト', () => {
  beforeEach(() => {
    cy.setupTestUser()
    cy.login()
  });

  it('登録番号のバリデーションチェック', () => {
    cy.visit('/invoices/new');
    
    // 不正な形式の登録番号をテスト
    cy.get('[data-cy=invoice-registration-number]').type('T12345');
    cy.get('[data-cy=submit-invoice]').click();
    assertErrorMessage('registration-number', '正しい形式で入力してください（例：T1234567890123）');

    // 正しい形式の登録番号
    cy.get('[data-cy=invoice-registration-number]')
      .clear()
      .type('T1234567890123');
    cy.get('[data-cy=registration-number-error]').should('not.exist');
  });

  it('税率別集計の正確性検証', () => {
    cy.visit('/invoices/new');
    
    // 軽減税率と標準税率の商品を追加
    createTestInvoice({
      items: [
        {
          itemName: '軽減税率対象品',
          quantity: 1,
          unitPrice: 1000,
          taxRate: 0.08
        },
        {
          itemName: '標準税率対象品',
          quantity: 1,
          unitPrice: 2000,
          taxRate: 0.10
        }
      ]
    });

    // 税率別の小計を確認
    assertTaxCalculation({
      subtotal: 1000,
      taxRate: 0.08,
      expectedTotal: 1080
    });
    assertTaxCalculation({
      subtotal: 2000,
      taxRate: 0.10,
      expectedTotal: 2200
    });
  });

  it('支払期限超過時の処理確認', () => {
    // 期限切れの請求書を作成
    const pastDate = format(new Date('2023-12-31'), 'yyyy-MM-dd');
    createTestInvoice({
      dueDate: pastDate,
      status: 'PENDING' as const
    });

    cy.visit('/invoices');
    
    // 期限切れ表示の確認
    cy.get('[data-cy=overdue-status]')
      .should('be.visible')
      .and('have.class', 'text-red-600');
    
    // アラート表示の確認
    cy.get('[data-cy=overdue-alert]')
      .should('be.visible')
      .and('contain', '支払期限が過ぎています');
  });

  it('取引先管理機能の異常系テスト', () => {
    cy.visit('/vendors/new');

    // 必須項目のバリデーション
    cy.get('[data-cy=submit-vendor]').click();
    cy.get('[data-cy=vendor-name-error]')
      .should('be.visible')
      .and('contain', '取引先名は必須です');
    cy.get('[data-cy=vendor-registration-number-error]')
      .should('be.visible')
      .and('contain', '登録番号は必須です');

    // 重複登録番号のチェック
    cy.get('[data-cy=vendor-name]').type('テスト取引先');
    cy.get('[data-cy=vendor-registration-number]').type('T1234567890123');
    cy.get('[data-cy=submit-vendor]').click();
    cy.get('[data-cy=duplicate-registration-error]')
      .should('be.visible')
      .and('contain', 'この登録番号は既に登録されています');
  });
});

describe('請求書バリデーション', () => {
  beforeEach(() => {
    cy.log('テストセッションのセットアップを開始');
    cy.setupTestSession();
    cy.visit('/invoices/create');
  });

  it('必須項目の検証', () => {
    cy.log('バリデーションテストを開始');
    // 空の状態で保存を試みる
    cy.get('[data-cy=save-button]').click();

    // 必須項目のエラーメッセージを確認
    assertErrorMessage('registration-number', '必須です');
    assertErrorMessage('vendor-id', '取引先を選択してください');
    assertErrorMessage('issue-date', '必須です');
    assertErrorMessage('due-date', '必須です');
    assertErrorMessage('items', '明細は1件以上必要です');
  });

  it('不正な金額入力のバリデーション', () => {
    // 基本情報の入力
    createTestInvoice({
      items: [
        {
          itemName: 'テスト商品',
          quantity: -1,
          unitPrice: -1000,
          taxRate: TAX_RATES.STANDARD
        }
      ]
    });

    // エラーメッセージの確認
    assertErrorMessage('item-quantity', '数量は1以上を入力してください');
    assertErrorMessage('item-unit-price', '単価は0以上を入力してください');
  });

  it('不正な税率の入力チェック', () => {
    // 基本情報の入力
    cy.get('[data-cy=registration-number]').type('T1234567890123');
    cy.get('[data-cy=vendor-select]').click().type('テスト取引先{enter}');
    cy.get('[data-cy=issue-date]').type('2024-03-20');
    cy.get('[data-cy=due-date]').type('2024-04-20');

    // 明細の追加
    cy.get('[data-cy=add-item-button]').click();
    cy.get('[data-cy=item-name]').type('テスト商品');
    cy.get('[data-cy=item-quantity]').type('1');
    cy.get('[data-cy=item-unit-price]').type('1000');
    
    // 不正な税率の選択
    cy.get('[data-cy=tax-rate-select]').select('0.05');

    // エラーメッセージの確認
    cy.get('[data-cy=tax-rate-error]').should('contain', '不正な税率です');
    
    // 正しい税率の選択
    cy.get('[data-cy=tax-rate-select]').select(String(TAX_RATES.REDUCED));
    cy.get('[data-cy=tax-rate-error]').should('not.exist');
  });

  it('請求書番号の形式チェック', () => {
    // 不正な形式の請求書番号を入力
    cy.get('[data-cy=registration-number]').type('12345');
    cy.get('[data-cy=save-button]').click();
    cy.get('[data-cy=registration-number-error]')
      .should('contain', '正しい形式で入力してください（例：T1234567890123）');

    // 正しい形式の請求書番号を入力
    cy.get('[data-cy=registration-number]').clear().type('T1234567890123');
    cy.get('[data-cy=registration-number-error]').should('not.exist');
  });

  it('権限のない操作の制限チェック', () => {
    // 一般ユーザーとしてログイン
    cy.login({ role: 'USER' });
    cy.visit('/invoices');

    // 承認済み請求書の編集を試みる
    cy.get('[data-cy=invoice-status]').contains('APPROVED').parent().click();
    cy.get('[data-cy=edit-button]').should('be.disabled');
    cy.get('[data-cy=edit-disabled-message]').should('contain', '承認済みの請求書は編集できません');

    // 請求書の承認操作を試みる
    cy.get('[data-cy=approve-button]').should('be.disabled');
    cy.get('[data-cy=approve-disabled-message]').should('contain', '承認権限がありません');
  });

  it('大規模データの表示とページネーション', () => {
    cy.task('seedLargeDataset', { count: 500 });
    cy.visit('/invoices');
    
    // ページネーションの検証
    assertPagination(500, 50);
  });
}); 