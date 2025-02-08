describe('取引先管理 (MVP)', () => {
  describe('一般ユーザー', () => {
    beforeEach(() => {
      // 一般ユーザーとしてログイン
      cy.login('user@example.com', 'test-password')
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

    it('他のユーザーの取引先は表示されない', () => {
      // 管理者が作成した取引先は表示されないことを確認
      cy.contains('管理者作成の取引先').should('not.exist')
    })

    it('他のユーザーの取引先は編集できない', () => {
      // 他のユーザーの取引先の編集ページに直接アクセス
      cy.visit('/vendors/other-user-vendor/edit')
      
      // 403エラーページにリダイレクトされることを確認
      cy.url().should('include', '/403')
      cy.contains('アクセス権限がありません').should('exist')
    })
  })

  describe('管理者', () => {
    beforeEach(() => {
      // 管理者としてログイン
      cy.login('admin@example.com', 'test-password')
      cy.visit('/vendors')
    })

    it('全ての取引先を表示できる', () => {
      // 一般ユーザーが作成した取引先も表示されることを確認
      cy.contains('テスト株式会社').should('exist')
      cy.contains('管理者作成の取引先').should('exist')
    })

    it('他のユーザーの取引先を編集できる', () => {
      // 他のユーザーの取引先を編集
      cy.contains('テスト株式会社')
        .parent()
        .find('[data-cy=edit-vendor-button]')
        .click()

      cy.get('[data-cy=vendor-name-input]').clear().type('管理者が更新')
      cy.get('[data-cy=submit-vendor-button]').click()

      // 更新が成功することを確認
      cy.contains('管理者が更新').should('exist')
    })
  })

  describe('バリデーション', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'test-password')
      cy.visit('/vendors')
    })

    it('必須項目のバリデーション', () => {
      // 新規作成画面に移動
      cy.get('[data-cy=create-vendor-button]').click()

      // 必須項目を空のまま送信
      cy.get('[data-cy=submit-vendor-button]').click()

      // バリデーションエラーが表示されることを確認
      cy.get('[data-cy=vendor-name-input]:invalid').should('exist')
      cy.get('[data-cy=vendor-email-input]:invalid').should('exist')
    })

    it('タグの制限', () => {
      cy.get('[data-cy=create-vendor-button]').click()

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
})