describe('取引先管理', () => {
  beforeEach(() => {
    // テストデータのクリーンアップ
    cy.cleanupTestData()
    
    // 認証状態のセットアップ
    cy.setupAuthState()
    
    // 取引先一覧ページにアクセス
    cy.visit('/vendors')
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('取引先の新規登録', () => {
    // 新規登録ページに移動
    cy.get('[data-cy=create-vendor-button]').click()
    cy.url().should('include', '/vendors/new')

    // フォームの入力
    cy.get('[data-cy=vendor-name-input]').type('テスト株式会社')
    cy.get('[data-cy=vendor-email-input]').type('test-vendor@example.com')
    cy.get('[data-cy=vendor-phone-input]').type('03-1234-5678')
    cy.get('[data-cy=vendor-address-input]').type('東京都千代田区...')

    // タグの追加(最大2つ)
    cy.get('[data-cy=vendor-tag-input]').type('重要')
    cy.get('[data-cy=add-tag-button]').click()
    cy.get('[data-cy=vendor-tag-input]').type('取引先')
    cy.get('[data-cy=add-tag-button]').click()

    // 保存
    cy.get('[data-cy=submit-vendor-button]').click()

    // 登録成功の確認
    cy.url().should('include', '/vendors')
    cy.contains('テスト株式会社').should('exist')
  })

  it('取引先情報の編集', () => {
    // テストデータのセットアップ
    cy.setupTestData()

    // 既存の取引先を選択
    cy.contains('テスト株式会社').click()

    // フォームの編集
    cy.get('[data-cy=vendor-name-input]').clear().type('更新テスト株式会社')
    cy.get('[data-cy=submit-vendor-button]').click()

    // 更新成功の確認
    cy.url().should('include', '/vendors')
    cy.contains('更新テスト株式会社').should('exist')
  })

  it('取引先の検索', () => {
    // テストデータのセットアップ
    cy.setupTestData()

    // 検索の実行
    cy.get('[data-cy=vendor-search-input]').type('テスト')

    // 検索結果の確認
    cy.contains('テスト株式会社').should('exist')
  })

  it('取引先の削除', () => {
    // テストデータのセットアップ
    cy.setupTestData()

    // 削除の実行
    cy.contains('テスト株式会社')
      .parent()
      .find('[data-cy=delete-vendor-button]')
      .click({ force: true })

    // 削除成功の確認
    cy.contains('テスト株式会社').should('not.exist')
  })

  it('バリデーション', () => {
    // 新規作成ページに移動
    cy.get('[data-cy=create-vendor-button]').click()

    // 必須項目を空のまま送信
    cy.get('[data-cy=submit-vendor-button]').click()

    // バリデーションエラーの確認
    cy.get('[data-cy=vendor-name-input]:invalid').should('exist')
    cy.get('[data-cy=vendor-email-input]:invalid').should('exist')

    // 3つ目のタグを追加しようとする
    cy.get('[data-cy=vendor-tag-input]').type('タグ1')
    cy.get('[data-cy=add-tag-button]').click()
    cy.get('[data-cy=vendor-tag-input]').type('タグ2')
    cy.get('[data-cy=add-tag-button]').click()
    cy.get('[data-cy=vendor-tag-input]').type('タグ3')
    cy.get('[data-cy=add-tag-button]').click()

    // エラーメッセージの確認
    cy.contains('タグは最大2つまでしか設定できません').should('exist')
  })
})