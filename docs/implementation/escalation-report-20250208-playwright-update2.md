# Playwrightテスト実装における技術的課題の報告(第2版)

## 1. 追加の調査結果

### 1.1 問題の詳細な分析

```log
pw:api => browser.newContext started +2ms
pw:api   "commit" event fired +530ms
pw:api   "domcontentloaded" event fired +0ms
pw:api   "load" event fired +0ms
pw:api navigating to "https://playwright/index.html" waiting until "load" +20ms
```

1. タイミングの特定

   - browser.newContextの呼び出し直後に発生
   - リクエストインターセプト設定の前に発生
   - ページ作成前の段階で既に発生

2. 試行した対策の結果
   - about:blankの明示的な指定 → 効果なし
   - リクエストインターセプト → 遅すぎて効果なし
   - 初期ページの待機 → 既に不要なナビゲーションが発生

### 1.2 新たな知見

1. 問題の本質

   - Playwrightの内部実装レベルでの動作
   - コンテキスト初期化時の自動的なナビゲーション
   - アプリケーションレベルでの制御が困難

2. 制御の限界
   - リクエストインターセプトは遅すぎる
   - 設定による回避が困難
   - ブラウザコンテキストの初期化プロセスに深く組み込まれている

## 2. 必要なガイダンス

### 2.1 技術的な確認事項

1. ブラウザコンテキストの初期化

   - 初期ページのナビゲーションを完全に無効化する方法
   - 推奨される初期化シーケンス
   - 内部実装レベルでの制御方法

2. 既知の問題との関連
   - 同様の問題の報告事例
   - 公式な回避策の有無
   - 将来的な改善予定

### 2.2 具体的な質問事項

1. コンテキスト初期化

   ```typescript
   const context = await browser.newContext({
     baseURL: "about:blank",
     viewport: { width: 1280, height: 720 },
   });
   ```

   - この設定で初期ページのナビゲーションを防げない理由
   - 推奨される設定値や初期化手順

2. イベント制御
   ```typescript
   context.on("page", async (page) => {
     page.on("request", (request) => {
       if (request.url().includes("playwright/index.html")) {
         request.abort();
       }
     });
   });
   ```
   - このアプローチが機能しない理由
   - より早い段階でのイベントフック方法

## 3. 今後の方向性の確認

1. 短期的な対応案

   - 不要なナビゲーションを許容する方針の是非
   - テストケース構造の見直し
   - 代替的なテストアプローチ

2. 中長期的な検討事項
   - Playwrightのバージョン変更
   - 代替テストフレームワークの検討
   - テスト戦略の見直し

## 4. 承認依頼事項

1. 技術的な方針

   - Playwright開発チームへの問い合わせ承認
   - 代替アプローチの検討開始
   - テスト戦略の見直し

2. リソース配分
   - 調査継続の優先度
   - 代替案検討のためのリソース確保

以上の内容について、ご確認とご指示をお願いいたします。
