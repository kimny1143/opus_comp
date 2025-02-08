describe('請求書管理 (MVP)', () => {
  describe('一般ユーザー', () => {
    beforeEach(() => {
      // 一般ユーザーとしてログイン
      cy.login('user@example.com', 'test-password')
      cy.visit('/invoices')
    })

    it('自分の請求書のみ表示される', () => {
      // 他のユーザーの請求書は表示されないことを確認
      cy.contains('管理者の請求書').should('not.exist')
    })

    it('基本的なCRUD操作', () => {
      // 新規作成
      cy.get('[data-cy=create-invoice-button]').click()
      cy.url().should('include', '/invoices/new')

      // 取引先の選択
      cy.get('[data-cy=vendor-select]').click()
      cy.contains('テスト株式会社').click()

      // 金額の入力
      cy.get('[data-cy=amount-input]').type('10000')

      // 保存
      cy.get('[data-cy=submit-invoice-button]').click()

      // 一覧に戻ることを確認
      cy.url().should('equal', `${Cypress.config().baseUrl}/invoices`)

      // 作成した請求書が表示されることを確認
      cy.contains('10,000円').should('exist')
      cy.contains('下書き').should('exist')

      // 編集
      cy.contains('10,000円')
        .parent()
        .find('[data-cy=edit-invoice-button]')
        .click()

      // 金額を更新
      cy.get('[data-cy=amount-input]').clear().type('20000')
      cy.get('[data-cy=submit-invoice-button]').click()

      // 更新された値が表示されることを確認
      cy.contains('20,000円').should('exist')

      // 削除
      cy.contains('20,000円')
        .parent()
        .find('[data-cy=delete-invoice-button]')
        .click()

      // 削除確認
      cy.get('[data-cy=confirm-delete-button]').click()

      // 削除された請求書が表示されないことを確認
      cy.contains('20,000円').should('not.exist')
    })

    it('他のユーザーの請求書は編集できない', () => {
      // 他のユーザーの請求書の編集ページに直接アクセス
      cy.visit('/invoices/other-user-invoice/edit')
      
      // 403エラーページにリダイレクトされることを確認
      cy.url().should('include', '/403')
      cy.contains('アクセス権限がありません').should('exist')
    })

    it('承認済み請求書は編集/削除できない', () => {
      // 承認済み請求書の編集ボタンが非表示
      cy.contains('承認済み請求書')
        .parent()
        .find('[data-cy=edit-invoice-button]')
        .should('not.exist')

      // 承認済み請求書の削除ボタンが非表示
      cy.contains('承認済み請求書')
        .parent()
        .find('[data-cy=delete-invoice-button]')
        .should('not.exist')
    })

    it('請求書を承認できない', () => {
      // 承認ボタンが表示されないことを確認
      cy.get('[data-cy=approve-invoice-button]').should('not.exist')
    })
  })

  describe('管理者', () => {
    beforeEach(() => {
      // 管理者としてログイン
      cy.login('admin@example.com', 'test-password')
      cy.visit('/invoices')
    })

    it('全ての請求書を表示できる', () => {
      // 一般ユーザーの請求書も表示されることを確認
      cy.contains('テストユーザーの請求書').should('exist')
      cy.contains('管理者の請求書').should('exist')
    })

    it('他のユーザーの請求書を編集できる', () => {
      // 他のユーザーの請求書を編集
      cy.contains('テストユーザーの請求書')
        .parent()
        .find('[data-cy=edit-invoice-button]')
        .click()

      cy.get('[data-cy=amount-input]').clear().type('30000')
      cy.get('[data-cy=submit-invoice-button]').click()

      // 更新が成功することを確認
      cy.contains('30,000円').should('exist')
    })

    it('請求書を承認できる', () => {
      // 下書き状態の請求書を承認
      cy.contains('下書き')
        .parent()
        .find('[data-cy=approve-invoice-button]')
        .click()

      // 承認確認
      cy.get('[data-cy=confirm-approve-button]').click()

      // ステータスが承認済みに変更されることを確認
      cy.contains('承認済み').should('exist')
    })
  })

  describe('バリデーション', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'test-password')
      cy.visit('/invoices/new')
    })

    it('必須項目のバリデーション', () => {
      // 取引先と金額を入力せずに保存
      cy.get('[data-cy=submit-invoice-button]').click()

      // バリデーションエラーが表示されることを確認
      cy.get('[data-cy=vendor-select]:invalid').should('exist')
      cy.get('[data-cy=amount-input]:invalid').should('exist')
    })

    it('金額のバリデーション', () => {
      // 負の金額を入力
      cy.get('[data-cy=amount-input]').type('-1000')
      cy.get('[data-cy=submit-invoice-button]').click()

      // エラーメッセージが表示されることを確認
      cy.contains('金額は0より大きい値を入力してください').should('exist')
    })
  })
})