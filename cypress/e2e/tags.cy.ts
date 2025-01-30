/// <reference types="cypress" />

describe('タグ機能', () => {
  let testData: {
    userId: string
    vendorId: string
    purchaseOrderId: string
    invoiceId: string
    tagId: string
  }

  beforeEach(() => {
    cy.log('テストセッションのセットアップを開始');
    cy.setupTestSession();
    cy.visit('/settings/tags');
    cy.setupTestUser()
    cy.login()
    // テストデータのセットアップ
    cy.task('db:seed').then((data) => {
      testData = data as typeof testData
    })
  })

  it('タグの追加と削除', () => {
    cy.log('タグ機能テストを開始');
    // 請求書詳細ページに移動
    cy.visit(`/invoices/${testData.invoiceId}`)

    // 新しいタグを追加
    cy.get('[data-testid="tag-input"]').type('新しいタグ')
    cy.get('[data-testid="add-tag-button"]').click()

    // タグが追加されたことを確認
    cy.contains('新しいタグ').should('exist')

    // タグを削除
    cy.get('[data-testid="delete-tag-button"]').first().click()
    cy.contains('新しいタグ').should('not.exist')
  })

  it('既存のタグを関連付け', () => {
    // 請求書詳細ページに移動
    cy.visit(`/invoices/${testData.invoiceId}`)

    // 既存のタグを追加
    cy.get('[data-testid="tag-input"]').type('既存タグ')
    cy.get('[data-testid="add-tag-button"]').click()

    // タグが追加されたことを確認
    cy.contains('既存タグ').should('exist')
  })

  it('エラー状態の表示', () => {
    // APIエラーをシミュレート
    cy.intercept('POST', '/api/tags', {
      statusCode: 500,
      body: { error: 'サーバーエラーが発生しました' }
    })

    // 請求書詳細ページに移動
    cy.visit(`/invoices/${testData.invoiceId}`)

    // タグを追加してエラーを確認
    cy.get('[data-testid="tag-input"]').type('エラーテスト')
    cy.get('[data-testid="add-tag-button"]').click()

    // エラーメッセージが表示されることを確認
    cy.contains('サーバーエラーが発生しました').should('exist')
  })

  it('ローディング状態の表示', () => {
    // APIレスポンスを遅延させる
    cy.intercept('POST', '/api/tags', (req) => {
      req.reply({
        delay: 1000,
        body: { success: true }
      })
    })

    // 請求書詳細ページに移動
    cy.visit(`/invoices/${testData.invoiceId}`)

    // タグを追加
    cy.get('[data-testid="tag-input"]').type('遅延テスト')
    cy.get('[data-testid="add-tag-button"]').click()

    // 入力が無効化されることを確認
    cy.get('[data-testid="tag-input"]').should('be.disabled')
    cy.get('[data-testid="add-tag-button"]').should('be.disabled')
  })
}) 