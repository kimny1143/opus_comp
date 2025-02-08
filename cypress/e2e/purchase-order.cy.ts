describe('発注フォーム', () => {
  beforeEach(() => {
    // テストユーザーのセットアップとログイン
    cy.setupTestUser();
    cy.login({ role: 'ADMIN' });
    
    // 発注フォームページに移動
    cy.visit('/purchase-orders/new');
    
    // フォームの表示を待機
    cy.get('form, [data-testid="purchase-order-form"]').should('be.visible');
    cy.get('button[aria-label="品目を追加"]').should('be.visible');
  });

  it('基本的なフォーム入力と送信', () => {
    // 品目追加
    cy.get('button[aria-label="品目を追加"]').click();

    // 品目情報の入力
    cy.get('input[name="items.0.name"]').type('テスト商品');
    cy.get('input[name="items.0.quantity"]').type('10');
    cy.get('input[name="items.0.unitPrice"]').type('1000');
    cy.get('select[name="items.0.taxRate"]').select('0.10');

    // フォーム送信
    cy.get('button[type="submit"]').click();

    // 送信後の状態確認
    cy.url().should('match', /\/purchase-orders\/\d+/);
  });

  it('バリデーションエラー', () => {
    cy.get('button[aria-label="品目を追加"]').click();

    // 不正な値を入力
    cy.get('input[name="items.0.name"]').type('a'.repeat(51));
    cy.get('input[name="items.0.quantity"]').type('0');
    cy.get('input[name="items.0.unitPrice"]').type('-1');

    cy.get('button[type="submit"]').click();

    // エラーメッセージの確認
    cy.contains('品目名は50文字以内で入力してください').should('be.visible');
    cy.contains('数量は1以上を入力してください').should('be.visible');
    cy.contains('単価は0以上を入力してください').should('be.visible');
  });

  it('パフォーマンス要件', () => {
    // 1. 初期表示時間の計測
    cy.visit('/purchase-orders/new', {
      onBeforeLoad(win) {
        const startTime = performance.now();
        cy.wrap(startTime).as('pageLoadStart');
      },
      onLoad() {
        cy.get('@pageLoadStart').then((startTime: number) => {
          const loadTime = performance.now() - startTime;
          expect(loadTime).to.be.lessThan(2000); // 2秒以内
        });
      },
    });

    // 2. 品目追加のレスポンス時間
    cy.window().then((win) => {
      const startTime = performance.now();
      cy.wrap(startTime).as('addItemStart');
    });
    cy.get('button[aria-label="品目を追加"]').click();
    cy.get('@addItemStart').then((startTime: number) => {
      const addItemTime = performance.now() - startTime;
      expect(addItemTime).to.be.lessThan(100); // 100ms以内
    });

    // 3. 入力フィールドのレスポンス時間
    cy.window().then((win) => {
      const startTime = performance.now();
      cy.wrap(startTime).as('inputStart');
    });
    cy.get('input[name="items.0.unitPrice"]').type('1000');
    cy.get('@inputStart').then((startTime: number) => {
      const inputResponseTime = performance.now() - startTime;
      expect(inputResponseTime).to.be.lessThan(100); // 100ms以内
    });

    // 4. バリデーション応答時間
    cy.get('button[aria-label="品目を追加"]').click();
    cy.window().then((win) => {
      const startTime = performance.now();
      cy.wrap(startTime).as('validationStart');
    });
    cy.get('input[name="items.1.quantity"]').type('0').blur();
    cy.contains('数量は1以上を入力してください').should('be.visible');
    cy.get('@validationStart').then((startTime: number) => {
      const validationTime = performance.now() - startTime;
      expect(validationTime).to.be.lessThan(200); // 200ms以内
    });
  });

  it('大量データ入力時のパフォーマンス', () => {
    // 50件の品目を追加
    const addItems = (count: number) => {
      if (count === 0) return;

      cy.get('button[aria-label="品目を追加"]').click();
      const index = 50 - count;
      cy.get(`input[name="items.${index}.itemName"]`).type(`テスト商品${index}`);
      cy.get(`input[name="items.${index}.quantity"]`).type('1');
      cy.get(`input[name="items.${index}.unitPrice"]`).type('1000');
      cy.get(`select[name="items.${index}.taxRate"]`).select('0.10');

      // 10件ごとにパフォーマンスチェック
      if ((index + 1) % 10 === 0) {
        // DOMノード数の確認
        cy.get('*').its('length').should('be.lessThan', 5000);
        // フォーム要素数の確認
        cy.get('input, select, button').its('length').should('be.lessThan', 1000);
      }

      // 再帰的に次の品目を追加
      cy.then(() => addItems(count - 1));
    };

    // 50件の品目を追加
    addItems(50);

    // スクロールとレンダリングのパフォーマンスを確認
    cy.window().then((win) => {
      const startTime = performance.now();
      cy.wrap(startTime).as('scrollStart');
    });
    cy.scrollTo('bottom');
    cy.get('@scrollStart').then((startTime: number) => {
      const scrollTime = performance.now() - startTime;
      expect(scrollTime).to.be.lessThan(100);
    });

    // 大量データ入力後のレスポンス時間確認
    cy.window().then((win) => {
      const startTime = performance.now();
      cy.wrap(startTime).as('lastInputStart');
    });
    cy.get('input[name="items.49.unitPrice"]').clear().type('2000');
    cy.get('@lastInputStart').then((startTime: number) => {
      const lastRowInputTime = performance.now() - startTime;
      expect(lastRowInputTime).to.be.lessThan(100);
    });
  });
});