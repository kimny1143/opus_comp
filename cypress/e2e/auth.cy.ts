import { format } from 'date-fns'

describe('認証機能', () => {
  describe('パスワードポリシー', () => {
    beforeEach(() => {
      cy.visit('/auth/signup')
      cy.intercept('POST', '/api/auth/signup').as('signupRequest')
      
      // フォームが表示されるまで待機
      cy.get('form').should('be.visible')
    })

    it('パスワードポリシーに準拠していない場合はエラーを表示', () => {
      // メールアドレスを入力
      cy.get('[data-cy=email-input]').type('test@example.com')

      // 8文字未満のパスワード
      cy.get('[data-cy=password-input]').type('Test123')
      cy.get('[data-cy=confirm-password-input]').type('Test123')
      cy.get('[data-cy=submit-button]').click()
      cy.get('[data-cy=password-error]', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'パスワードは8文字以上で入力してください')

      // 大文字なしのパスワード
      cy.get('[data-cy=password-input]').clear().type('test1234')
      cy.get('[data-cy=confirm-password-input]').clear().type('test1234')
      cy.get('[data-cy=submit-button]').click()
      cy.get('[data-cy=password-error]', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'パスワードは大文字、小文字、数字を含める必要があります')

      // 小文字なしのパスワード
      cy.get('[data-cy=password-input]').clear().type('TEST1234')
      cy.get('[data-cy=confirm-password-input]').clear().type('TEST1234')
      cy.get('[data-cy=password-error]')
        .should('be.visible')
        .and('contain', 'パスワードは大文字、小文字、数字を含める必要があります')

      // 数字なしのパスワード
      cy.get('[data-cy=password-input]').clear().type('TestPass')
      cy.get('[data-cy=confirm-password-input]').clear().type('TestPass')
      cy.get('[data-cy=password-error]')
        .should('be.visible')
        .and('contain', 'パスワードは大文字、小文字、数字を含める必要があります')
    })

    it('パスワードポリシーに準拠している場合は登録が成功する', () => {
      const testEmail = `test${Date.now()}@example.com`
      const validPassword = 'TestPass123'

      cy.get('[data-cy=email-input]').type(testEmail)
      cy.get('[data-cy=password-input]').type(validPassword)
      cy.get('[data-cy=confirm-password-input]').type(validPassword)
      
      // フォームの送信
      cy.get('[data-cy=submit-button]').click()

      // APIリクエストの検証
      cy.wait('@signupRequest', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201])
        expect(interception.request.body).to.deep.equal({
          email: testEmail,
          password: validPassword,
          confirmPassword: validPassword
        })
      })

      // サインインページへのリダイレクトを確認
      cy.url().should('include', '/auth/signin')
    })

    it('パスワード確認が一致しない場合はエラーを表示', () => {
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=password-input]').type('TestPass123')
      cy.get('[data-cy=confirm-password-input]').type('TestPass124')
      
      // フォームの送信
      cy.get('form').submit()

      cy.get('[data-cy=confirm-password-error]')
        .should('be.visible')
        .and('contain', 'パスワードが一致しません')
    })

    it('既存のメールアドレスでの登録を防ぐ', () => {
      const existingEmail = 'test@example.com'
      const validPassword = 'TestPass123'

      // 既存ユーザーを作成
      cy.request({
        method: 'POST',
        url: '/api/auth/signup',
        body: {
          email: existingEmail,
          password: validPassword,
          confirmPassword: validPassword
        },
        failOnStatusCode: false
      })

      // 既存ユーザーでの登録を試みる
      cy.get('[data-cy=email-input]').type(existingEmail)
      cy.get('[data-cy=password-input]').type(validPassword)
      cy.get('[data-cy=confirm-password-input]').type(validPassword)
      
      cy.get('[data-cy=submit-button]').click()

      // エラーメッセージの確認
      cy.get('[data-cy=email-error]', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'このメールアドレスは既に登録されています')
    })
  })
}) 