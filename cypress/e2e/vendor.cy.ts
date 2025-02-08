describe('取引先管理', () => {
  beforeEach(() => {
    cy.setupTestData();
    cy.setupAuthState();
    cy.task('db:seed');
    cy.visit('/vendors');
  });

  afterEach(() => {
    cy.task('db:cleanup');
    cy.cleanupTestData();
  });

  it('取引先の新規登録', () => {
    // 新規登録ページに移動
    cy.contains('新規登録').click();
    cy.url().should('include', '/vendors/new');

    // フォームの入力
    cy.get('form').within(() => {
      cy.get('select[name="category"]').select('CORPORATION');
      cy.get('select[name="status"]').select('ACTIVE');
      cy.get('input[name="name"]').type('新規テスト株式会社');
      cy.get('input[name="email"]').type('new-test@example.com');
      cy.get('input[name="phone"]').type('03-9999-8888');
      cy.get('input[name="address"]').type('東京都千代田区...');
      cy.get('input[name="bankInfo.bankName"]').type('テスト銀行');
      cy.get('input[name="bankInfo.branchName"]').type('テスト支店');
      cy.get('select[name="bankInfo.accountType"]').select('ORDINARY');
      cy.get('input[name="bankInfo.accountNumber"]').type('1234567');
      cy.get('input[name="bankInfo.accountHolder"]').type('カブシキガイシャテスト');
      cy.get('button[type="submit"]').click();
    });

    // 登録成功の確認
    cy.url().should('include', '/vendors');
    cy.contains('新規テスト株式会社').should('exist');
  });

  it('取引先情報の編集', () => {
    // 既存の取引先を選択
    cy.contains('テスト株式会社').click();
    cy.contains('button', '編集').click();

    // フォームの編集
    cy.get('form').within(() => {
      cy.get('input[name="name"]').clear().type('更新テスト株式会社');
      cy.get('button[type="submit"]').click();
    });

    // 更新成功の確認
    cy.url().should('include', '/vendors');
    cy.contains('更新テスト株式会社').should('exist');
  });

  it('取引先の検索', () => {
    // 検索の実行
    cy.get('input[placeholder*="検索"]').type('テスト');
    cy.get('button[aria-label="検索"]').click();

    // 検索結果の確認
    cy.contains('テスト株式会社').should('exist');
    cy.contains('サンプル商事').should('not.exist');
  });

  it('取引先のタグ管理', () => {
    // タグの追加
    cy.contains('テスト株式会社').click();
    cy.get('[aria-label="タグを追加"]').click();
    cy.get('input[placeholder*="タグ"]').type('重要{enter}');

    // タグの確認
    cy.get('[role="status"]').contains('タグを追加しました').should('exist');
    cy.contains('重要').should('exist');

    // タグの削除
    cy.get('[aria-label="タグを削除"]').click();
    cy.get('[role="status"]').contains('タグを削除しました').should('exist');
    cy.contains('重要').should('not.exist');
  });
});