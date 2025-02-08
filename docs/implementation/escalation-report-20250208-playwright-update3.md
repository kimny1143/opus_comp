# Playwrightテスト実装における技術的課題の報告(第3版)

## 1. 環境情報

- Playwrightバージョン: 1.50.0
- Next.js バージョン: 15.1.6

## 2. 最新の調査結果

### 2.1 実装戦略の変更

不要なナビゲーションを抑制する代わりに、「意図的に待機してから本来のURLへ移動する」戦略を試行:

```typescript
// 新しいコンテキストを作成
const context = await browser.newContext({
  baseURL: "about:blank",
  viewport: { width: 1280, height: 720 },
});

// 初期の不要なナビゲーションが完了するまで待機
await page.waitForLoadState("domcontentloaded");
await page.waitForLoadState("networkidle");

// その後、本来のURLへ移動
await page.goto("http://localhost:3000/auth/signin");
```

### 2.2 動作ログの分析

```log
pw:api => browser.newContext started +1ms
pw:api   "commit" event fired +545ms
pw:api   navigating to "https://playwright/index.html" waiting until "load" +24ms
pw:api   "commit" event fired +51ms
pw:api   navigated to "https://playwright/index.html" +0ms
```

1. 観察された動作

   - browser.newContext()直後に不要なナビゲーションが発生
   - waitForLoadState()による待機は機能している
   - 本来のURLへの移動も成功

2. 残存する課題
   - 不要なナビゲーションは依然として発生
   - パフォーマンスへの影響の可能性
   - テストの安定性への懸念

## 3. 新たな知見

### 3.1 Playwrightの内部動作

1. コンテキスト初期化

   - newContext()呼び出し時に自動的なナビゲーションが発生
   - この動作はバージョン1.50.0でも確認

2. 待機戦略
   - domcontentloadedとnetworkidleの両方を待機
   - 初期ページの完全な読み込みを確認

### 3.2 対応オプション

1. 現在の方針(推奨)

   - 不要なナビゲーションを許容
   - 完全な読み込み完了を待機
   - その後で本来のURLへ移動

2. 代替案
   - Persistent Contextの使用検討
   - ブラウザレベルでのイベントフック
   - 異なるバージョンの検討

## 4. 今後の方向性

### 4.1 短期的な対応

1. 現在の実装の維持

   - 不要なナビゲーションを許容
   - 確実な待機処理の実装
   - エラーハンドリングの強化

2. パフォーマンス最適化
   - タイムアウト値の調整
   - 待機条件の最適化

### 4.2 中長期的な検討

1. バージョン戦略

   - 新しいバージョンでの改善可能性
   - 既知の問題の修正状況

2. アーキテクチャ検討
   - テストの構造見直し
   - より効率的なセットアップ方法

## 5. 承認依頼事項

1. 現在の実装方針の承認

   - 不要なナビゲーションを許容する方針
   - 待機戦略の妥当性

2. 追加の調査方針
   - 他のバージョンでのテスト実施
   - パフォーマンス影響の測定

以上の内容について、ご確認とご指示をお願いいたします。
