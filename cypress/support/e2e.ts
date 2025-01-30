/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      task(event: 'seedLargeDataset', options: { count: number }): Chainable<void>
      clock(timestamp: number): Chainable<void>
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

// テスト開始時のログ
beforeEach(() => {
  cy.logTestInfo('テスト開始', {
    env: Cypress.env(),
    baseUrl: Cypress.config('baseUrl')
  });
});

// テスト終了時のログ
afterEach(() => {
  cy.logTestInfo('テスト終了', {
    status: (cy as any).state('test').state,
    duration: (cy as any).state('test').duration
  });
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