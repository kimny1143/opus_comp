describe('認証フロー', () => {
  beforeEach(() => {
    // テストの前にCookieをクリア
    cy.clearCookie('auth-token')
  })

  it('ログインが成功する', () => {
    // ログインページにアクセス
    cy.visit('/login')

    // フォームの入力
    cy.get('[data-cy=email-input]').type('test@example.com')
    cy.get('[data-cy=password-input]').type('test-password')
    cy.get('[data-cy=login-button]').click()

    // ダッシュボードにリダイレクトされることを確認
    cy.url().should('include', '/dashboard')
  })

  it('無効な認証情報でログインが失敗する', () => {
    cy.visit('/login')

    // 無効な認証情報を入力
    cy.get('[data-cy=email-input]').type('invalid@example.com')
    cy.get('[data-cy=password-input]').type('wrongpassword')
    cy.get('[data-cy=login-button]').click()

    // エラーメッセージが表示されることを確認
    cy.get('[data-cy=error-message]')
      .should('be.visible')
      .and('contain', '認証に失敗しました')

    // ログインページに留まることを確認
    cy.url().should('include', '/login')
  })

  it('必須フィールドの検証', () => {
    cy.visit('/login')

    // 空のフォームを送信
    cy.get('[data-cy=login-button]').click()

    // バリデーションメッセージを確認
    cy.get('[data-cy=email-error]')
      .should('be.visible')
      .and('contain', 'メールアドレスは必須です')
    cy.get('[data-cy=password-error]')
      .should('be.visible')
      .and('contain', 'パスワードは必須です')
  })

  it('ログアウトが正常に動作する', () => {
    // ログイン状態を作成
    cy.login('test@example.com', 'test-password')
    cy.visit('/dashboard')

    // ログアウトボタンをクリック
    cy.get('[data-cy=logout-button]').click()

    // ログインページにリダイレクトされることを確認
    cy.url().should('include', '/login')

    // 保護されたページにアクセスできないことを確認
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })
})