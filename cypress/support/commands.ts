/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * ログインを実行するカスタムコマンド
       */
      login(email: string, password: string): Chainable<void>

      /**
       * テストデータをセットアップするカスタムコマンド
       */
      setupTestData(): Chainable<void>

      /**
       * テストデータをクリーンアップするカスタムコマンド
       */
      cleanupTestData(): Chainable<void>

      /**
       * 認証状態をセットアップするカスタムコマンド
       */
      setupAuthState(): Chainable<void>
    }
  }
}

// ログインコマンド
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  cy.url().should('include', '/dashboard')
})

// テストデータのセットアップ
Cypress.Commands.add('setupTestData', () => {
  cy.task('db:seed')
})

// テストデータのクリーンアップ
Cypress.Commands.add('cleanupTestData', () => {
  cy.task('db:cleanup')
})

// 認証状態のセットアップ
Cypress.Commands.add('setupAuthState', () => {
  cy.login('test@example.com', 'password123')
})

export {}