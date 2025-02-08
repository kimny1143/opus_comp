# テストガイド [Cypress版]

## 1. テストフレームワーク構成

### 1.1 使用するフレームワーク

- **Vitest**: ユニット/コンポーネントテスト用
- **Cypress**: E2Eテスト用
- **React Testing Library**: コンポーネントテスト用

※ Jestは使用しない(既存のJest環境は廃止)

### 1.2 環境設定

#### Vitest設定

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 30000,
    maxWorkers: "50%",
  },
});
```

#### Cypress設定

```javascript
// cypress.config.js (もしくは cypress.config.ts)
module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    defaultCommandTimeout: 10000,
  },
};
```

## 2. テストの種類と役割

### 2.1 ユニット/コンポーネントテスト (Vitest)

- 個別の関数やコンポーネントの動作確認
- 80%以上のカバレッジを目標
- テストファイルは対象ファイルと同じディレクトリに配置

```typescript
// 例: src/components/invoice/__tests__/InvoiceForm.test.tsx
describe('InvoiceForm', () => {
  it('初期表示時に必要なフィールドが表示されること', () => {
    render(<InvoiceForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/ステータス/i)).toBeInTheDocument();
  });
});
```

### 2.2 E2Eテスト (Cypress)

- ユーザーフローの検証
- 実際のブラウザ環境での動作確認
- テストファイルは `cypress/e2e/` ディレクトリに配置

```javascript
// 例: cypress/e2e/invoice.cy.js
describe("請求書作成フロー", () => {
  it("新規請求書を作成", () => {
    cy.visit("/invoices/new");
    cy.get('[name="itemName"]').type("テスト商品");
    cy.get('button[type="submit"]').click();
    cy.url().should("match", /\/invoices\/\w+/);
  });
});
```

## 3. テストデータの管理

### 3.1 ファクトリ関数

- @/test/factories/ に集約
- 型定義と連動
- オーバーライド可能な設計

```typescript
// @/test/factories/invoice.ts
export const createTestInvoice = (
  overrides?: Partial<BaseInvoice>
): BaseInvoice => ({
  id: "test-id",
  status: "DRAFT",
  // ... デフォルト値
  ...overrides,
});
```

### 3.2 モックデータ

- @/test/mocks/ に集約
- 環境依存の外部サービスをモック化
- テスト用の環境変数を使用

## 4. テスト実行環境

### 4.1 環境変数

- .env.test を使用
- CI環境でも同じ設定を使用
- 秘匿情報はGitHub Actionsで管理

### 4.2 実行コマンド

```bash
# ユニット/コンポーネントテスト (Vitest)
npm run test

# E2Eテスト (Cypress ※Headless実行)
npx cypress run

# E2Eテスト (Cypress ※GUI実行)
npx cypress open

# カバレッジレポート (Vitest)
npm run test:coverage
```

## 5. テスト作成ガイドライン

### 5.1 命名規則

- テストファイル: `*.test.ts(x)` または `*.spec.ts(x)`（Vitest）、`*.cy.ts(x)`（Cypress）
- テストケース: 期待する動作を日本語で明確に
- モック関数: `mock` プレフィックスを使用

### 5.2 構造化

```typescript
describe("コンポーネント/機能名", () => {
  // 前処理
  beforeEach(() => {
    // セットアップ
  });

  // 正常系テスト
  it("期待する動作の説明", () => {
    // テスト内容
  });

  // エラー系テスト
  it("エラー時の動作の説明", () => {
    // テスト内容
  });
});
```

### 5.3 アサーション

- 明確な期待値を設定
- ユーザー視点でのアサーション
- 非決定的な値の扱いに注意

## 6. E2Eテスト作成のベストプラクティス

### 6.1 認証処理

- ログイン用のカスタムコマンド (例: `Cypress.Commands.add("login", ...)`) を作っておく
- sessionStorage / localStorage / cookies による認証情報の再利用
- テスト間の独立性を確保するため、できるだけ各テストでログイン手順を完結させる or before() で一括実行

### 6.2 待機処理

```javascript
// Cypressの例
cy.visit("/dashboard");
// 何らかの要素が表示されるまで待機
cy.get("h1").should("be.visible");
```

### 6.3 スクリーンショットやビデオ記録

- 失敗時のみ自動取得設定が可能 (`video: true/false` など)
- `cypress/screenshots/` ディレクトリに保存
- CIでの再現性を確保するため、バージョン固定や環境整合性を意識

## 7. パフォーマンステスト

### 7.1 基本方針

- Vitestの範囲内で実施(軽負荷)
- 重要な機能の処理時間を計測
- ベースラインを設定

### 7.2 測定項目

- ページ読み込み時間
- データ処理時間
- レンダリング時間

## 8. テストメンテナンス

### 8.1 定期的なレビュー

- 不要なテストの削除
- 重複テストの統合
- カバレッジの確認

### 8.2 CI/CD統合

- プルリクエスト時に全テスト実行
- カバレッジレポートの自動生成 (Vitest側)
- テスト失敗時の通知 (Cypress runの結果含む)

## 9. トラブルシューティング

### 9.1 よくある問題

1. フレイキーテスト(不安定なテスト)

   - 適切な`.should()` や `.wait()` を挟む
   - テスト間の依存関係の除去

2. パフォーマンス問題

   - テストの並列実行
   - 重いセットアップの共有

3. 環境依存の問題
   - モックの活用
   - 環境変数の適切な設定

### 9.2 デバッグ方法

1. Cypress

   - `npx cypress open` でGUI実行、操作しながらウォークスルー
   - スクリーンショットとビデオを有効にして詳細を確認

2. Vitest
   - `--inspect` フラグの使用
   - 詳細なログ出力
