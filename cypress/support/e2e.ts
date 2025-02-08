/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import './commands'
import './helpers'

declare global {
  namespace Cypress {
    interface Chainable {
      task(event: string, arg?: any): Chainable<any>
      intercept(method: string, url: string, response?: any): Chainable<void>
      intercept(url: string, response?: any): Chainable<void>
      /**
       * テスト情報をログ出力します
       * @example cy.logTestInfo('テスト開始')
       */
      logTestInfo(message: string, data?: Record<string, unknown>): Chainable<void>
    }
  }
}

// テスト情報のログ出力
Cypress.Commands.add('logTestInfo', (message: string, data?: Record<string, unknown>) => {
  const testInfo = {
    message,
    ...data,
    timestamp: new Date().toISOString(),
    testId: Cypress.currentTest.title,
    suite: Cypress.currentTest.titlePath[0],
    browser: Cypress.browser.name,
    viewport: Cypress.config('viewportWidth') + 'x' + Cypress.config('viewportHeight')
  };
  console.log(JSON.stringify(testInfo, null, 2));
  cy.log(JSON.stringify(testInfo, null, 2));
});

// テスト開始時のログとセットアップ
beforeEach(() => {
  // テストデータのセットアップ
  cy.setupTestData();

  // ログ出力
  cy.logTestInfo('テスト開始', {
    env: Cypress.env(),
    baseUrl: Cypress.config('baseUrl')
  });
});

// テスト終了時のログとクリーンアップ
afterEach(() => {
  // ログ出力
  cy.logTestInfo('テスト終了', {
    status: (cy as any).state('test').state,
    duration: (cy as any).state('test').duration
  });

  // テストデータのクリーンアップ
  cy.cleanupTestData();
});

// エラーハンドリング
Cypress.on('uncaught:exception', (err) => {
  // NEXT_REDIRECTエラーは無視
  if (err.message.includes('NEXT_REDIRECT')) {
    console.log('[Cypress] NEXT_REDIRECTエラーを無視:', {
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
  
  // その他のエラーはログに記録
  console.error('[Cypress] 未捕捉の例外が発生:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  return true;
});