/// <reference types="cypress" />
import './commands'

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

      /**
       * 要素をクリックするカスタムコマンド
       */
      clickElement(selector: string): Chainable<void>

      /**
       * テキストを入力するカスタムコマンド
       */
      typeText(selector: string, text: string): Chainable<void>

      /**
       * 要素が存在することを確認するカスタムコマンド
       */
      shouldExist(selector: string): Chainable<void>

      /**
       * 要素が存在しないことを確認するカスタムコマンド
       */
      shouldNotExist(selector: string): Chainable<void>
    }
  }
}

// カスタムコマンドの実装
Cypress.Commands.add('clickElement', (selector: string) => {
  cy.get(selector).click()
})

Cypress.Commands.add('typeText', (selector: string, text: string) => {
  cy.get(selector).type(text)
})

Cypress.Commands.add('shouldExist', (selector: string) => {
  cy.get(selector).should('exist')
})

Cypress.Commands.add('shouldNotExist', (selector: string) => {
  cy.get(selector).should('not.exist')
})

// Cypressのグローバル設定
Cypress.on('uncaught:exception', () => {
  // 未処理の例外を無視
  return false
})