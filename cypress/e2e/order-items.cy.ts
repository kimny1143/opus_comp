/// <reference types="cypress" />
// @ts-check

describe('明細行フォーム', () => {
  beforeEach(() => {
    cy.log('テストセッションのセットアップを開始');
    cy.setupTestSession();
    cy.visit('/orders/create');
  });

  it('明細行の追加と削除', () => {
    // 初期状態の確認
    cy.get('[data-cy=add-item-button]').should('exist');
    cy.get('[data-cy=items-container]').should('exist');
    cy.get('[data-cy=item-row]').should('not.exist');

    // 明細行の追加
    cy.get('[data-cy=add-item-button]').click();
    
    // 追加された要素の確認
    cy.get('[data-cy=item-row]').should('exist');
    cy.get('[data-cy=item-name]').should('exist');
    cy.get('[data-cy=item-quantity]').should('exist');
    cy.get('[data-cy=item-price]').should('exist');

    // 明細行の削除
    cy.get('[data-cy=delete-item-button]').click();
    cy.get('[data-cy=item-row]').should('not.exist');
  });

  it('金額計算の検証', () => {
    // 明細行の追加
    cy.get('[data-cy=add-item-button]').click();

    // 数量と単価の入力
    cy.get('[data-cy=item-quantity]').type('2');
    cy.get('[data-cy=item-price]').type('1000');

    // 計算結果の確認
    cy.get('[data-cy=subtotal]').should('contain', '2,000');
    cy.get('[data-cy=tax]').should('contain', '200');
    cy.get('[data-cy=total]').should('contain', '2,200');
  });

  it('バリデーションの検証', () => {
    // 明細行の追加
    cy.get('[data-cy=add-item-button]').click();

    // 不正な値の入力
    cy.get('[data-cy=item-quantity]').type('-1');
    cy.get('[data-cy=item-price]').type('-1000');

    // エラーメッセージの確認
    cy.get('[data-cy=quantity-error]')
      .should('exist')
      .and('contain', '数量は1以上を入力してください');
    cy.get('[data-cy=price-error]')
      .should('exist')
      .and('contain', '単価は0以上を入力してください');
  });

  it('複数明細行の追加と計算', () => {
    // 1つ目の明細行
    cy.get('[data-cy=add-item-button]').click();
    cy.get('[data-cy=item-name]').first().type('商品A');
    cy.get('[data-cy=item-quantity]').first().type('2');
    cy.get('[data-cy=item-price]').first().type('1000');

    // 2つ目の明細行
    cy.get('[data-cy=add-item-button]').click();
    cy.get('[data-cy=item-name]').last().type('商品B');
    cy.get('[data-cy=item-quantity]').last().type('3');
    cy.get('[data-cy=item-price]').last().type('2000');

    // 合計金額の確認
    cy.get('[data-cy=subtotal]').should('contain', '8,000'); // (2*1000 + 3*2000)
    cy.get('[data-cy=tax]').should('contain', '800');        // 8000 * 0.1
    cy.get('[data-cy=total]').should('contain', '8,800');    // 8000 + 800
  });
}); 