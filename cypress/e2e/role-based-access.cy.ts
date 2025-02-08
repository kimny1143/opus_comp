describe('ロールベースアクセス制御', () => {
  describe('一般ユーザー', () => {
    beforeEach(() => {
      // 一般ユーザーとしてログイン
      cy.login('user@example.com', 'test-password')
    })

    it('管理者専用ページにアクセスできない', () => {
      // 管理者専用ページへのアクセス試行
      cy.visit('/admin')
      
      // 403ページにリダイレクトされることを確認
      cy.url().should('include', '/403')
      cy.contains('403 - アクセス権限がありません').should('be.visible')
    })

    it('一般ページにアクセスできる', () => {
      // 一般ページへのアクセス
      cy.visit('/dashboard')
      
      // ダッシュボードが表示されることを確認
      cy.url().should('include', '/dashboard')
    })
  })

  describe('管理者', () => {
    beforeEach(() => {
      // 管理者としてログイン
      cy.login('admin@example.com', 'test-password')
    })

    it('管理者専用ページにアクセスできる', () => {
      // 管理者専用ページへのアクセス
      cy.visit('/admin')
      
      // アクセスが許可されることを確認
      cy.url().should('include', '/admin')
    })

    it('一般ページにもアクセスできる', () => {
      // 一般ページへのアクセス
      cy.visit('/dashboard')
      
      // ダッシュボードが表示されることを確認
      cy.url().should('include', '/dashboard')
    })
  })

  describe('APIアクセス制御', () => {
    it('一般ユーザーは管理者APIにアクセスできない', () => {
      // 一般ユーザーとしてログイン
      cy.login('user@example.com', 'test-password')
      
      // 管理者APIへのアクセス試行
      cy.request({
        url: '/api/admin/users',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403)
        expect(response.body).to.have.property('error', '権限がありません')
      })
    })

    it('管理者は管理者APIにアクセスできる', () => {
      // 管理者としてログイン
      cy.login('admin@example.com', 'test-password')
      
      // 管理者APIへのアクセス
      cy.request('/api/admin/users').then((response) => {
        expect(response.status).to.eq(200)
      })
    })
  })
})