describe('請求書管理 (MVP)', () => {
  beforeEach(() => {
    // 認証済みユーザーとしてログイン
    cy.login('test@example.com', 'password123')
    cy.visit('/invoices')
  })

  it('基本的なCRUD操作と承認フロー', () => {
    // 新規作成
    cy.get('[data-cy=create-invoice-button]').click()
    cy.url().should('include', '/invoices/new')

    // 取引先の選択
    cy.get('[data-cy=vendor-select]').select(1)

    // 金額の入力
    cy.get('[data-cy=amount-input]').type('10000')

    // 保存
    cy.get('[data-cy=submit-invoice-button]').click()

    // 一覧に戻ることを確認
    cy.url().should('equal', `${Cypress.config().baseUrl}/invoices`)

    // 作成した請求書が表示されることを確認
    cy.get('[data-cy=invoice-item]').should('exist')
    cy.contains('¥10,000').should('exist')
    cy.contains('下書き').should('exist')

    // 編集
    cy.get('[data-cy=edit-invoice-button]').first().click()

    // 金額を更新
    cy.get('[data-cy=amount-input]').clear().type('20000')
    cy.get('[data-cy=submit-invoice-button]').click()

    // 更新された金額が表示されることを確認
    cy.contains('¥20,000').should('exist')

    // 承認
    cy.get('[data-cy=approve-invoice-button]').first().click()

    // ステータスが更新されることを確認
    cy.contains('承認済み').should('exist')

    // 承認済みの請求書は編集・削除ボタンが表示されないことを確認
    cy.get('[data-cy=edit-invoice-button]').should('not.exist')
    cy.get('[data-cy=delete-invoice-button]').should('not.exist')

    // PDF出力
    cy.get('[data-cy=download-pdf-button]').first().click()
  })

  it('バリデーション', () => {
    // 新規作成画面に移動
    cy.get('[data-cy=create-invoice-button]').click()

    // 必須項目を空のまま送信
    cy.get('[data-cy=submit-invoice-button]').click()

    // バリデーションエラーが表示されることを確認
    cy.get('[data-cy=vendor-select]:invalid').should('exist')
    cy.get('[data-cy=amount-input]:invalid').should('exist')

    // 無効な金額を入力
    cy.get('[data-cy=vendor-select]').select(1)
    cy.get('[data-cy=amount-input]').type('-1000')
    cy.get('[data-cy=submit-invoice-button]').click()

    // エラーメッセージが表示されることを確認
    cy.get('[data-cy=amount-input]:invalid').should('exist')
  })

  it('下書き請求書の削除', () => {
    // 新規作成
    cy.get('[data-cy=create-invoice-button]').click()
    cy.get('[data-cy=vendor-select]').select(1)
    cy.get('[data-cy=amount-input]').type('10000')
    cy.get('[data-cy=submit-invoice-button]').click()

    // 削除(確認ダイアログを自動承認)
    cy.get('[data-cy=delete-invoice-button]').first().click({ force: true })

    // 削除された請求書が表示されないことを確認
    cy.contains('¥10,000').should('not.exist')
  })
})