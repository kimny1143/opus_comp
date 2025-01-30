/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * テストセッションのセットアップ
     */
    setupTestSession(): Chainable<void>;

    /**
     * テストユーザーのセットアップ
     */
    setupTestUser(): Chainable<void>;

    /**
     * ログイン処理
     */
    login(options?: { role?: string }): Chainable<void>;

    /**
     * 請求書の作成
     */
    createInvoice(data: any): Chainable<void>;

    /**
     * テスト情報のログ出力
     */
    logTestInfo(message: string, data?: Record<string, unknown>): Chainable<void>;
  }

  interface Interception {
    response?: {
      statusCode: number;
      body: any;
      headers: Record<string, string>;
    };
    request?: {
      body: any;
      headers: Record<string, string>;
      url: string;
      method: string;
    };
  }
}

export {}; 