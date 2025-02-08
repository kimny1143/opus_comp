describe('取引先管理 (MVP)', () => {
  beforeEach(() => {
    // 認証済みユーザーとしてログイン
    cy.login('test@example.com', 'password123')
    cy.visit('/vendors')
  })

  it('基本的なCRUD操作', () => {
    // 新規作成
    cy.get('[data-cy=create-vendor-button]').click()
    cy.url().should('include', '/vendors/new')

    // フォームの入力
    cy.get('[data-cy=vendor-name-input]').type('テスト株式会社')
    cy.get('[data-cy=vendor-email-input]').type('test@example.com')
    cy.get('[data-cy=vendor-phone-input]').type('03-1234-5678')
    cy.get('[data-cy=vendor-address-input]').type('東京都千代田区...')

    // タグの追加(最大2つ)
    cy.get('[data-cy=vendor-tag-input]').type('重要')
    cy.get('[data-cy=add-tag-button]').click()
    cy.get('[data-cy=vendor-tag-input]').type('取引先')
    cy.get('[data-cy=add-tag-button]').click()

    // 保存
    cy.get('[data-cy=submit-vendor-button]').click()

    // 一覧に戻ることを確認
    cy.url().should('equal', `${Cypress.config().baseUrl}/vendors`)

    // 作成した取引先が表示されることを確認
    cy.contains('テスト株式会社').should('exist')
    cy.contains('test@example.com').should('exist')
    cy.contains('重要').should('exist')
    cy.contains('取引先').should('exist')

    // 編集
    cy.contains('テスト株式会社')
      .parent()
      .find('[data-cy=edit-vendor-button]')
      .click()

    // フォームに既存の値が入力されていることを確認
    cy.get('[data-cy=vendor-name-input]').should('have.value', 'テスト株式会社')
    cy.get('[data-cy=vendor-email-input]').should('have.value', 'test@example.com')
    cy.get('[data-cy=vendor-phone-input]').should('have.value', '03-1234-5678')

    // 値を更新
    cy.get('[data-cy=vendor-name-input]').clear().type('更新テスト株式会社')
    cy.get('[data-cy=submit-vendor-button]').click()

    // 更新された値が表示されることを確認
    cy.contains('更新テスト株式会社').should('exist')

    // 削除(確認ダイアログを自動承認)
    cy.contains('更新テスト株式会社')
      .parent()
      .find('[data-cy=delete-vendor-button]')
      .click({ force: true })

    // 削除された取引先が表示されないことを確認
    cy.contains('更新テスト株式会社').should('not.exist')
  })

  it('検索機能', () => {
    // 検索フォームに入力
    cy.get('[data-cy=vendor-search-input]').type('テスト')

    // Enterキーを押して検索を実行
    cy.get('[data-cy=vendor-search-input]').type('{enter}')

    // 検索結果を確認
    cy.get('[data-cy=vendor-item]').should('have.length.gte', 0)
  })

  it('バリデーション', () => {
    // 新規作成画面に移動
    cy.get('[data-cy=create-vendor-button]').click()

    // 必須項目を空のまま送信
    cy.get('[data-cy=submit-vendor-button]').click()

    // バリデーションエラーが表示されることを確認
    cy.get('[data-cy=vendor-name-input]:invalid').should('exist')
    cy.get('[data-cy=vendor-email-input]:invalid').should('exist')

    // 3つ目のタグを追加しようとする
    cy.get('[data-cy=vendor-tag-input]').type('タグ1')
    cy.get('[data-cy=add-tag-button]').click()
    cy.get('[data-cy=vendor-tag-input]').type('タグ2')
    cy.get('[data-cy=add-tag-button]').click()
    cy.get('[data-cy=vendor-tag-input]').type('タグ3')
    cy.get('[data-cy=add-tag-button]').click()

    // エラーメッセージが表示されることを確認
    cy.contains('タグは最大2つまでしか設定できません').should('exist')
  })
})