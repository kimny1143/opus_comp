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

// 既存のコマンド
Cypress.Commands.add('setupTestUser', () => {
  // テストユーザーのセットアップ
  cy.request({
    method: 'POST',
    url: '/api/test/setup-user',
    body: {
      email: 'test@example.com',
      role: 'ADMIN'
    }
  });
})

Cypress.Commands.add('login', (options = {}) => {
  // ログイン処理
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'test@example.com',
      password: 'password123',
      role: options.role || 'USER'
    }
  });
})

Cypress.Commands.add('setTestDate', (date: string) => {
  const timestamp = new Date(date).getTime()
  cy.clock(timestamp)
})

Cypress.Commands.add('clearSession', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
})

Cypress.Commands.add('createInvoice', (data) => {
  // 請求書の作成
  cy.request({
    method: 'POST',
    url: '/api/invoices',
    body: data
  });
})

// セッション管理のヘルパー関数
Cypress.Commands.add('setupTestSession', () => {
  // テストセッションのセットアップ
  cy.session('testUser', () => {
    // ここにセッションのセットアップロジックを追加
  });
})

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
  cy.get('input[name="email"]').type('test@example.com');
  cy.get('input[name="password"]').type('TestPass123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
  
  // セッションの保存はCypressが自動的に行う
});

Cypress.Commands.add('setupVendorAuthState', () => {
  cy.visit('/vendor-portal/signin');
  cy.get('input[name="email"]').type('vendor@example.com');
  cy.get('input[name="password"]').type('VendorPass123');
  cy.get('button[type="submit"]').click();
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
})

// APIリクエストのインターセプト
Cypress.Commands.overwrite('intercept', (originalFn, ...args) => {
  return originalFn(...args);
})

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