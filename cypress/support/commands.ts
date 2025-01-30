/// <reference types="cypress" />

import '@testing-library/cypress/add-commands'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * テストユーザーとしてログインします
       * @example cy.login()
       */
      login(): Chainable<void>
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
    }
  }
}

Cypress.Commands.add('setupTestUser', () => {
  const testUser = {
    name: 'Test User',
    email: Cypress.env('TEST_USER_EMAIL') || 'test@example.com',
    password: 'TestPass123',
    confirmPassword: 'TestPass123'
  }

  return cy.request({
    method: 'POST',
    url: '/api/auth/signup',
    body: testUser,
    failOnStatusCode: false
  }).then((response) => {
    // レスポンスの構造をログ出力
    cy.log('Signup Response:', JSON.stringify(response.body, null, 2))

    // ユーザーが既に存在する場合は成功として扱う
    if (response.status === 400 && response.body?.message?.includes('既に登録されています')) {
      cy.log('テストユーザーは既に存在します')
      return cy.wrap(null)
    }

    // 新規作成の場合は201を期待
    if (response.status === 201) {
      cy.log('テストユーザーを作成しました')
      return cy.wrap(null)
    }

    // その他のエラーの場合は失敗
    throw new Error(`ユーザー作成に失敗しました: ${response.status} - ${JSON.stringify(response.body)}`)
  })
})

Cypress.Commands.add('login', () => {
  // セッションを使用してログイン状態を維持
  return cy.session('testUser', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/callback/credentials',
      body: {
        email: Cypress.env('TEST_USER_EMAIL') || 'test@example.com',
        password: Cypress.env('TEST_USER_PASSWORD') || 'TestPass123',
        redirect: false,
        callbackUrl: '/invoices',
        json: true
      },
      failOnStatusCode: false
    }).then((response) => {
      // レスポンスの構造をログ出力
      cy.log('Auth Response:', JSON.stringify(response.body, null, 2))

      // ステータスコードを確認
      if (response.status !== 200) {
        throw new Error(`ログインに失敗しました: ${response.status} - ${JSON.stringify(response.body)}`)
      }

      // セッショントークンが作成されるまで待機（最大10秒）
      cy.wait(1000) // 初期待機
      let retries = 0
      const checkSession = () => {
        if (retries >= 10) {
          throw new Error('セッショントークンの作成がタイムアウトしました')
        }
        cy.getCookie('next-auth.session-token').then((cookie) => {
          if (!cookie) {
            retries++
            cy.wait(1000)
            checkSession()
          } else {
            expect(cookie.value).to.be.a('string')
            expect(cookie.value.length).to.be.greaterThan(0)
          }
        })
      }
      checkSession()

      // CSRFトークンの存在を確認
      cy.getCookie('next-auth.csrf-token').should('exist')
    })
  }, {
    validate: () => {
      // セッションの検証を強化
      cy.getCookie('next-auth.session-token').should('exist').then((cookie) => {
        expect(cookie.value).to.be.a('string')
        expect(cookie.value.length).to.be.greaterThan(0)
      })
      // ダッシュボードにアクセスしてセッションが有効か確認
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
    },
    cacheAcrossSpecs: true
  })
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
  // セッショントークンを取得
  return cy.getCookie('next-auth.session-token').then((cookie) => {
    if (!cookie) {
      cy.log('セッショントークンが見つかりません。ログインを実行します。')
      cy.login()
    }
    
    return cy.request({
      method: 'POST',
      url: '/api/invoices',
      body: {
        ...data,
        status: data.status || 'DRAFT'
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cookie?.value}`
      }
    }).then((response) => {
      expect(response.status).to.eq(201)
      return response.body
    })
  })
})

// セッション管理のヘルパー関数
Cypress.Commands.add('setupTestSession', () => {
  const maxRetries = 10;
  const retryInterval = 1000;

  const checkSession = (retryCount = 0) => {
    return cy.getCookie('next-auth.session-token').then((cookie) => {
      if (cookie) {
        cy.log('セッショントークンが見つかりました');
        return;
      }

      if (retryCount >= maxRetries) {
        throw new Error('セッショントークンの取得に失敗しました');
      }

      cy.log(`セッショントークンを待機中... (${retryCount + 1}/${maxRetries})`);
      cy.wait(retryInterval);
      checkSession(retryCount + 1);
    });
  };

  cy.session('testUser', () => {
    cy.log('テストユーザーのセットアップを開始');
    cy.visit('/auth/signin');
    cy.get('input[name="email"]').type(Cypress.env('TEST_USER_EMAIL') || 'test@example.com');
    cy.get('input[name="password"]').type(Cypress.env('TEST_USER_PASSWORD') || 'TestPass123');
    cy.get('button[type="submit"]').click();

    // セッショントークンの生成を待機
    checkSession();

    // ダッシュボードへのリダイレクトを確認
    cy.url().should('include', '/dashboard');
  });
});

export {}
export {} 