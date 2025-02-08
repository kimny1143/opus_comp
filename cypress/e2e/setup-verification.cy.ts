describe('セットアップ検証', () => {
  beforeEach(() => {
    cy.cleanupTestData()
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('認証フローが正常に動作する', () => {
    // 認証前は保護されたページにアクセスできない
    cy.visit('/dashboard')
    cy.url().should('include', '/login')

    // ログインが成功する
    cy.login('test@example.com', 'password123')
    cy.url().should('include', '/dashboard')

    // ログアウトが成功する
    cy.get('[data-cy=logout-button]').click()
    cy.url().should('include', '/login')
  })

  it('取引先管理の基本機能が動作する', () => {
    // 認証
    cy.setupAuthState()

    // 取引先一覧にアクセス
    cy.visit('/vendors')
    cy.url().should('include', '/vendors')

    // 新規作成
    cy.get('[data-cy=create-vendor-button]').click()
    cy.get('[data-cy=vendor-name-input]').type('テスト株式会社')
    cy.get('[data-cy=vendor-email-input]').type('test@example.com')
    cy.get('[data-cy=submit-vendor-button]').click()

    // 作成した取引先が表示される
    cy.contains('テスト株式会社').should('exist')
  })

  it('請求書管理の基本機能が動作する', () => {
    // 認証とテストデータのセットアップ
    cy.setupAuthState()
    cy.setupTestData()

    // 請求書一覧にアクセス
    cy.visit('/invoices')
    cy.url().should('include', '/invoices')

    // 新規作成
    cy.get('[data-cy=create-invoice-button]').click()
    cy.get('[data-cy=vendor-select]').select(1)
    cy.get('[data-cy=amount-input]').type('10000')
    cy.get('[data-cy=submit-invoice-button]').click()

    // 作成した請求書が表示される
    cy.contains('¥10,000').should('exist')
    cy.contains('下書き').should('exist')
  })
})