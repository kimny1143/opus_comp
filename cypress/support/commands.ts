/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
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
      task(event: string, arg?: any): Chainable<any>
      intercept(method: string, url: string, response?: any): Chainable<void>
      intercept(url: string, response?: any): Chainable<void>
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
  // フォームベースの認証を使用
  cy.visit('/auth/signin');
  cy.get('form[name="signin-form"]').within(() => {
    cy.get('input[name="email"]').type(Cypress.env('TEST_USER_EMAIL') || 'test@example.com');
    cy.get('input[name="password"]').type(Cypress.env('TEST_USER_PASSWORD') || 'TestPassword123!');
    cy.get('button[type="submit"]').click();
  });
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

// ログイン処理
Cypress.Commands.add('login', (options = {}) => {
  cy.visit('/auth/signin');
  cy.get('form[name="signin-form"]').within(() => {
    cy.get('input[name="email"]').type(Cypress.env('TEST_USER_EMAIL') || 'test@example.com');
    cy.get('input[name="password"]').type(Cypress.env('TEST_USER_PASSWORD') || 'TestPassword123!');
    cy.get('button[type="submit"]').click();
  });
  cy.url().should('eq', Cypress.config().baseUrl + '/');
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
    cy.visit('/auth/signin');
    cy.get('form[name="signin-form"]').within(() => {
      cy.get('input[name="email"]').type(Cypress.env('TEST_USER_EMAIL') || 'test@example.com');
      cy.get('input[name="password"]').type(Cypress.env('TEST_USER_PASSWORD') || 'TestPassword123!');
      cy.get('button[type="submit"]').click();
    });
    cy.url().should('eq', Cypress.config().baseUrl + '/');
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
  cy.visit('/auth/signin');
  cy.get('form[name="signin-form"]').within(() => {
    cy.get('input[name="email"]').type(Cypress.env('TEST_USER_EMAIL') || 'test@example.com');
    cy.get('input[name="password"]').type(Cypress.env('TEST_USER_PASSWORD') || 'TestPassword123!');
    cy.get('button[type="submit"]').click();
  });
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

Cypress.Commands.add('setupVendorAuthState', () => {
  cy.visit('/vendor-portal/signin');
  cy.get('form[name="signin-form"]').within(() => {
    cy.get('input[name="email"]').type(Cypress.env('VENDOR_EMAIL') || 'vendor@example.com');
    cy.get('input[name="password"]').type(Cypress.env('VENDOR_PASSWORD') || 'VendorPass123!');
    cy.get('button[type="submit"]').click();
  });
  cy.url().should('include', '/vendor-portal');
});

Cypress.Commands.add('clearAuthState', () => {
  cy.visit('/auth/signout');
  cy.url().should('include', '/auth/signin');
  cy.clearCookies();
  cy.clearLocalStorage();
});

// データベースのシード処理
Cypress.Commands.overwrite('task', (originalFn, event, arg) => {
  return originalFn(event, arg);
});

// APIリクエストのインターセプト
Cypress.Commands.overwrite('intercept', (originalFn, ...args) => {
  return originalFn(...args);
});

// モックデータ生成ヘルパー関数
export const getMockOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => {
  return {
    name: 'テスト商品',
    quantity: 1,
    unitPrice: 1000,
    taxRate: 0.10,
    ...overrides
  };
};

export {}