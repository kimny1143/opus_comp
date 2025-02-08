/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * ログインを実行するカスタムコマンド
     * @example
     * cy.login('test@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>

    /**
     * テストデータをセットアップするカスタムコマンド
     * @example
     * cy.setupTestData()
     */
    setupTestData(): Chainable<void>

    /**
     * テストデータをクリーンアップするカスタムコマンド
     * @example
     * cy.cleanupTestData()
     */
    cleanupTestData(): Chainable<void>

    /**
     * 認証状態をセットアップするカスタムコマンド
     * @example
     * cy.setupAuthState()
     */
    setupAuthState(): Chainable<void>

    /**
     * 要素をクリックするカスタムコマンド
     * @example
     * cy.clickElement('[data-cy=button]')
     */
    clickElement(selector: string): Chainable<void>

    /**
     * テキストを入力するカスタムコマンド
     * @example
     * cy.typeText('[data-cy=input]', 'Hello')
     */
    typeText(selector: string, text: string): Chainable<void>

    /**
     * 要素が存在することを確認するカスタムコマンド
     * @example
     * cy.shouldExist('[data-cy=element]')
     */
    shouldExist(selector: string): Chainable<void>

    /**
     * 要素が存在しないことを確認するカスタムコマンド
     * @example
     * cy.shouldNotExist('[data-cy=element]')
     */
    shouldNotExist(selector: string): Chainable<void>
  }
}