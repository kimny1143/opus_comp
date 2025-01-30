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
      task(event: string, arg?: any): Chainable<any>
      intercept(method: string, url: string, response?: any): Chainable<void>
      intercept(url: string, response?: any): Chainable<void>
    }
  }
}

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

// データベースのシード処理
Cypress.Commands.overwrite('task', (originalFn, event, arg) => {
  return originalFn(event, arg);
})

// APIリクエストのインターセプト
Cypress.Commands.overwrite('intercept', (originalFn, ...args) => {
  return originalFn(...args);
})

export {} 