/// <reference types="cypress" />

import { mount } from 'cypress/react'

declare global {
  namespace Cypress {
    interface Chainable {
      // カスタムコマンドの型定義
      login(email: string, password: string): Chainable<void>
      setupTestData(): Chainable<void>
      cleanupTestData(): Chainable<void>
      setupAuthState(): Chainable<void>
      clickElement(selector: string): Chainable<void>
      typeText(selector: string, text: string): Chainable<void>
      shouldExist(selector: string): Chainable<void>
      shouldNotExist(selector: string): Chainable<void>

      // Reactコンポーネントのマウント
      mount: typeof mount
    }
  }
}

// グローバルな型定義
declare global {
  namespace Mocha {
    interface Context {
      [key: string]: any
    }
  }
}