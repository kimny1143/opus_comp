/// <reference types="cypress" />

export {}

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * テストユーザーとしてログインします
       * @example cy.login()
       */
      login(options?: { role?: string }): Chainable<void>
      /**
       * システム時刻を設定します
       * @example cy.setTestDate('2024-01-01')
       */
      setTestDate(date: string): Chainable<void>
      /**
       * セッションをクリアします
       * @example cy.clearSession()
       */
      clearSession(): Chainable<void>
      createInvoice(data: any): Chainable<void>
      setupTestUser(): Chainable<void>
      setupTestSession(): Chainable<void>
      /**
       * 発注品目を入力します
       * @example cy.fillOrderItem(0, { name: 'テスト商品', quantity: 1, unitPrice: 1000, taxRate: 0.1 })
       */
      fillOrderItem(index: number, item: OrderItem): Chainable<void>
      /**
       * 新しい発注品目を追加します
       * @example cy.addNewOrderItem()
       */
      addNewOrderItem(): Chainable<void>
      /**
       * フォームを送信します
       * @example cy.submitForm()
       */
      submitForm(): Chainable<void>
      /**
       * バリデーションの完了を待ちます
       * @example cy.waitForValidation()
       */
      waitForValidation(): Chainable<void>
      /**
       * 社内ユーザーとして認証状態をセットアップします
       * @example cy.setupAuthState()
       */
      setupAuthState(): Chainable<void>
      /**
       * 外部ユーザー(取引先)として認証状態をセットアップします
       * @example cy.setupVendorAuthState()
       */
      setupVendorAuthState(): Chainable<void>
      /**
       * 認証状態をクリアします
       * @example cy.clearAuthState()
       */
      clearAuthState(): Chainable<void>
      /**
       * テストデータをセットアップします
       * @example cy.setupTestData()
       */
      setupTestData(): Chainable<void>
      /**
       * テストデータをクリーンアップします
       * @example cy.cleanupTestData()
       */
      cleanupTestData(): Chainable<void>
    }
  }
}

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

// テストユーザーのセットアップ
Cypress.Commands.add('setupTestUser', () => {
  // APIを直接呼び出してテストユーザーを作成
  return cy.request({
    method: 'POST',
    url: '/api/test/setup-user',
    body: {
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'ADMIN'
    },
    failOnStatusCode: false
  }).then((response: Cypress.Response<any>) => {
    // ユーザーが既に存在する場合も成功とみなす
    if (response.status !== 201 && response.status !== 409) {
      throw new Error(`Failed to setup test user: ${response.status}`);
    }
  });
});

// ログイン処理
Cypress.Commands.add('login', (options = { role: 'USER' }) => {
  // APIを直接呼び出してログイン
  return cy.request({
    method: 'POST',
    url: '/api/auth/test/login',
    body: {
      email: 'test@example.com',
      role: options.role
    },
    failOnStatusCode: false
  }).then((response: Cypress.Response<any>) => {
    if (response.status !== 200) {
      // フォールバック: フォームベースのログイン
      cy.visit('/auth/signin');
      cy.get('[data-testid="signin-form"]').within(() => {
        cy.get('[data-testid="email-input"]').type('test@example.com');
        cy.get('[data-testid="password-input"]').type('TestPassword123!');
        cy.get('[data-testid="signin-button"]').click();
      });
    }
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('setTestDate', (date: string) => {
  const timestamp = new Date(date).getTime()
  cy.clock(timestamp)
});

Cypress.Commands.add('clearSession', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

Cypress.Commands.add('createInvoice', (data) => {
  // 請求書の作成
  cy.visit('/invoices/new');
  // フォームの入力処理を実装
});

// セッション管理のヘルパー関数
Cypress.Commands.add('setupTestSession', () => {
  cy.session('testUser', () => {
    cy.login();
  });
});

// 発注関連のコマンド
Cypress.Commands.add('fillOrderItem', (index: number, item: OrderItem) => {
  cy.get(`input[name="items.${index}.name"]`).type(item.name);
  cy.get(`input[name="items.${index}.quantity"]`).type(String(item.quantity));
  cy.get(`input[name="items.${index}.unitPrice"]`).type(String(item.unitPrice));
  cy.get(`select[name="items.${index}.taxRate"]`).select(String(item.taxRate));
});

Cypress.Commands.add('addNewOrderItem', () => {
  cy.get('button[aria-label="品目を追加"]').click();
});

Cypress.Commands.add('submitForm', () => {
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('waitForValidation', () => {
  // バリデーションの完了を待つ(200ms)
  cy.wait(200);
});

// 認証関連のコマンド
Cypress.Commands.add('setupAuthState', () => {
  cy.login({ role: 'ADMIN' });
});

Cypress.Commands.add('setupVendorAuthState', () => {
  cy.login({ role: 'VENDOR' });
});

Cypress.Commands.add('clearAuthState', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/test/logout',
    failOnStatusCode: false
  });
  cy.clearSession();
});

// テストデータ管理のコマンド
Cypress.Commands.add('setupTestData', () => {
  cy.task('setupTestDatabase', null, { timeout: 10000 });
});

Cypress.Commands.add('cleanupTestData', () => {
  cy.task('cleanupTestDatabase', null, { timeout: 10000 });
});