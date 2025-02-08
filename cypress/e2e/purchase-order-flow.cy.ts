describe('発注管理フロー', () => {
  beforeEach(() => {
    cy.setupTestUser();
    cy.login({ role: 'ADMIN' });
    cy.visit('/purchase-orders');
  });

  it('発注書の作成から承認までのフロー', () => {
    // 新規作成画面へ遷移
    cy.contains('新規作成').click();
    cy.url().should('include', '/purchase-orders/new');

    // 基本情報の入力
    cy.get('input[name="orderNumber"]').type('PO-2024-001');
    cy.get('input[name="orderDate"]').type('2024-03-01');
    cy.get('input[name="deliveryDate"]').type('2024-03-31');

    // 取引先の選択
    cy.get('button[aria-label="取引先を選択"]').click();
    cy.get('input[placeholder="取引先を検索"]').type('テスト取引先');
    cy.contains('テスト取引先').click();

    // 品目の追加(50件)
    for (let i = 0; i < 50; i++) {
      if (i > 0) {
        cy.get('button[aria-label="品目を追加"]').click();
      }
      cy.get(`input[name="items.${i}.itemName"]`).type(`テスト商品${i + 1}`);
      cy.get(`input[name="items.${i}.quantity"]`).type('1');
      cy.get(`input[name="items.${i}.unitPrice"]`).type('1000');
      cy.get(`select[name="items.${i}.taxRate"]`).select('0.1');
    }

    // 保存
    cy.get('button[type="submit"]').click();
    cy.contains('発注書を作成しました').should('be.visible');

    // 作成された発注書の確認
    cy.contains('PO-2024-001').should('be.visible');
    cy.contains('下書き').should('be.visible');

    // ステータスの変更(承認プロセス)
    cy.contains('PO-2024-001').click();
    cy.get('button[aria-label="ステータスを変更"]').click();
    cy.contains('承認待ち').click();
    cy.contains('承認待ち').should('be.visible');

    // 承認者による承認
    cy.get('button[aria-label="承認"]').click();
    cy.contains('発注済み').should('be.visible');
  });

  it('大量データの品目入力パフォーマンス', () => {
    cy.contains('新規作成').click();

    // 基本情報の入力
    cy.get('input[name="orderNumber"]').type('PO-2024-002');
    cy.get('input[name="orderDate"]').type('2024-03-01');
    cy.get('input[name="deliveryDate"]').type('2024-03-31');

    // パフォーマンス計測開始
    cy.window().then((win) => {
      const startTime = performance.now();
      cy.wrap(startTime).as('startTime');

      // 100件の品目を追加
      const addItems = (count: number) => {
        if (count === 0) {
          // 全品目の追加完了後、パフォーマンスを確認
          const endTime = performance.now();
          cy.get('@startTime').then((startTime: number) => {
            const duration = endTime - startTime;
            expect(duration).to.be.lessThan(10000); // 10秒以内
          });

          // 保存が正常に完了することを確認
          cy.get('button[type="submit"]').click();
          cy.contains('発注書を作成しました').should('be.visible');
          return;
        }

        const index = 100 - count;
        if (index > 0) {
          cy.get('button[aria-label="品目を追加"]').click();
        }
        cy.get(`input[name="items.${index}.itemName"]`).type(`テスト商品${index + 1}`);
        cy.get(`input[name="items.${index}.quantity"]`).type('1');
        cy.get(`input[name="items.${index}.unitPrice"]`).type('1000');
        cy.get(`select[name="items.${index}.taxRate"]`).select('0.1');

        // 再帰的に次の品目を追加
        cy.then(() => addItems(count - 1));
      };

      addItems(100);
    });
  });

  it('発注書の検索とフィルタリング', () => {
    // 検索
    cy.get('input[placeholder="検索"]').type('PO-2024{enter}');
    cy.contains('PO-2024-001').should('be.visible');

    // ステータスでフィルタリング
    cy.get('button[aria-label="ステータスでフィルタ"]').click();
    cy.contains('発注済み').click();
    cy.contains('発注済み').should('be.visible');

    // 日付範囲でフィルタリング
    cy.get('input[name="dateFrom"]').type('2024-03-01');
    cy.get('input[name="dateTo"]').type('2024-03-31');
    cy.get('button[aria-label="日付で絞り込み"]').click();
    cy.contains('2024-03').should('be.visible');
  });

  it('発注書の編集と更新', () => {
    cy.contains('PO-2024-001').click();
    cy.contains('編集').click();

    // 納期の変更
    cy.get('input[name="deliveryDate"]').clear().type('2024-04-30');

    // 品目の追加
    cy.get('button[aria-label="品目を追加"]').click();
    cy.get('input[name="items.50.itemName"]').type('追加商品');
    cy.get('input[name="items.50.quantity"]').type('1');
    cy.get('input[name="items.50.unitPrice"]').type('2000');
    cy.get('select[name="items.50.taxRate"]').select('0.1');

    // 保存
    cy.get('button[type="submit"]').click();
    cy.contains('発注書を更新しました').should('be.visible');

    // 変更内容の確認
    cy.contains('2024-04-30').should('be.visible');
    cy.contains('追加商品').should('be.visible');
  });

  it('発注書の進捗管理', () => {
    cy.contains('PO-2024-001').click();

    // 進捗ステータスの更新
    cy.get('button[aria-label="進捗を更新"]').click();
    cy.contains('納品済み').click();
    cy.contains('納品済み').should('be.visible');

    // コメントの追加
    cy.get('textarea[name="comment"]').type('納品確認完了');
    cy.get('button[aria-label="コメントを追加"]').click();
    cy.contains('納品確認完了').should('be.visible');

    // 履歴の確認
    cy.get('button[aria-label="履歴を表示"]').click();
    cy.contains('ステータスを「納品済み」に更新').should('be.visible');
  });
});