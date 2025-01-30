import { format } from 'date-fns';
import { vendorSchema } from '../../src/types/validation/vendorSchema';

describe('パフォーマンステスト', () => {
  beforeEach(() => {
    cy.log('テストセッションのセットアップを開始');
    cy.setupTestSession();
  });

  it('大量データの読み込みテスト', () => {
    cy.log('パフォーマンステストを開始');
    cy.task('seedLargeDataset', { count: 100 });
    cy.visit('/invoices');
    cy.get('[data-cy=invoice-list]').should('exist');
    cy.get('[data-cy=invoice-item]').should('have.length.at.least', 50);
  });

  it('大規模データセットの読み込みテスト', () => {
    // 500件のテストデータを生成
    cy.task('seedLargeDataset', { count: 500 });
    
    // ページ読み込み時間の計測開始
    const startTime = performance.now();
    
    cy.visit('/invoices').then(() => {
      const loadTime = performance.now() - startTime;
      expect(loadTime).to.be.lessThan(3000); // 3秒以内に読み込みが完了すること
    });

    // 1ページあたり50件表示の確認
    cy.get('[data-cy=invoice-list-item]').should('have.length', 50);
    cy.get('[data-cy=total-count]').should('contain', '500');

    // ページネーションの動作確認
    cy.get('[data-cy=pagination-next]').click();
    cy.get('[data-cy=invoice-list-item]').should('have.length', 50);
    cy.get('[data-cy=current-page]').should('contain', '2');
  });

  it('一括操作のパフォーマンステスト', () => {
    // 100件の請求書を選択
    cy.get('[data-cy=select-all]').click();
    cy.get('[data-cy=invoice-checkbox]:checked').should('have.length', 50);

    // 一括承認の実行時間計測
    const startTime = performance.now();
    cy.get('[data-cy=bulk-approve]').click();
    cy.get('[data-cy=confirmation-dialog]').should('be.visible');
    cy.get('[data-cy=confirm-button]').click();

    // 処理完了の確認と時間計測
    cy.get('[data-cy=success-message]').should('be.visible').then(() => {
      const processTime = performance.now() - startTime;
      expect(processTime).to.be.lessThan(5000); // 5秒以内に処理が完了すること
    });
  });

  it('検索・フィルタリングの応答時間テスト', () => {
    // 検索クエリの入力と応答時間計測
    const startTime = performance.now();
    cy.get('[data-cy=search-input]').type('テスト請求書');
    
    // 検索結果の表示を待機
    cy.get('[data-cy=invoice-list-item]').should('exist').then(() => {
      const searchTime = performance.now() - startTime;
      expect(searchTime).to.be.lessThan(1000); // 1秒以内に結果が表示されること
    });

    // フィルタリングの応答時間計測
    const filterStartTime = performance.now();
    cy.get('[data-cy=status-filter]').select('APPROVED');
    
    // フィルタリング結果の表示を待機
    cy.get('[data-cy=invoice-list-item]').should('exist').then(() => {
      const filterTime = performance.now() - filterStartTime;
      expect(filterTime).to.be.lessThan(1000); // 1秒以内に結果が表示されること
    });
  });
}); 