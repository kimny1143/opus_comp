describe('取引先管理', () => {
  beforeEach(() => {
    // テストユーザーのセットアップとログイン
    cy.setupTestUser();
    cy.login({ role: 'ADMIN' });
    cy.visit('/vendors');
  });

  it('取引先の新規登録', () => {
    cy.contains('新規登録').click();
    cy.get('input[name="name"]').type('テスト株式会社');
    cy.get('input[name="email"]').type('test-vendor@example.com');
    cy.get('input[name="registrationNumber"]').type('T123456789012');
    cy.get('input[name="phoneNumber"]').type('03-1234-5678');
    
    // 住所情報の入力
    cy.get('input[name="address.postalCode"]').type('100-0001');
    cy.get('input[name="address.prefecture"]').type('東京都');
    cy.get('input[name="address.city"]').type('千代田区');
    cy.get('input[name="address.street"]').type('丸の内1-1-1');
    
    cy.get('button[type="submit"]').click();
    
    // 登録完了の確認
    cy.contains('取引先を登録しました').should('be.visible');
  });

  it('取引先情報の編集', () => {
    cy.contains('テスト株式会社').click();
    cy.contains('編集').click();
    cy.get('input[name="phoneNumber"]').clear().type('03-9876-5432');
    cy.get('button[type="submit"]').click();
    
    // 更新完了の確認
    cy.contains('取引先情報を更新しました').should('be.visible');
  });

  it('取引先の検索', () => {
    cy.get('input[placeholder="検索"]').type('テスト株式会社{enter}');
    
    // 検索結果の確認
    cy.contains('テスト株式会社').should('be.visible');
    cy.contains('test-vendor@example.com').should('be.visible');
  });

  it('取引先のタグ管理', () => {
    cy.contains('テスト株式会社').click();
    cy.get('button[aria-label="タグを追加"]').click();
    cy.get('input[name="tagName"]').type('重要取引先');
    cy.get('button[type="submit"]').click();
    
    // タグ追加の確認
    cy.contains('重要取引先').should('be.visible');
  });
});