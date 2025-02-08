# セキュリティガイドライン説明会資料

## 1. 概要

### 1.1 目的

- OPUSの開発環境におけるセキュリティ基準の理解
- 具体的な実践方法の習得
- インシデント対応フローの把握

### 1.2 本日の内容

1. セキュリティガイドラインの解説
2. 実践的なセキュリティ対策
3. インシデント対応演習

## 2. セキュリティガイドライン

### 2.1 アクセス制御

```typescript
// 悪い例
const config = {
  apiKey: "1234567890", // ハードコードされた認証情報
  endpoint: "https://api.example.com",
};

// 良い例
const config = {
  apiKey: process.env.API_KEY, // 環境変数から取得
  endpoint: process.env.API_ENDPOINT,
};
```

### 2.2 依存関係管理

```bash
# 推奨される運用
npm audit        # 定期的な脆弱性チェック
npm outdated     # 更新が必要なパッケージの確認
npm update       # パッケージの更新
```

### 2.3 コード管理

```typescript
// 悪い例: 機密情報の直接記述
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password123",
});

// 良い例: 環境変数の使用
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

## 3. 実践演習

### 3.1 セキュリティチェックリスト

- [ ] npm auditの実行
- [ ] .envファイルの確認
- [ ] GitIgnoreの設定確認
- [ ] 依存パッケージの確認

### 3.2 コードレビュー演習

```typescript
// レビュー対象コード
function processUserData(data: any) {
  // 要改善
  const sql = `SELECT * FROM users WHERE id = ${data.id}`; // インジェクションの危険
  return db.query(sql);
}

// 改善後のコード
function processUserData(data: UserData) {
  // 型安全
  const sql = "SELECT * FROM users WHERE id = ?";
  return db.query(sql, [data.id]); // パラメータ化クエリ
}
```

## 4. インシデント対応演習

### 4.1 シナリオ1: 不正アクセス検知

1. 異常な認証試行の検知
2. セキュリティ管理者への報告
3. 影響範囲の特定
4. 対策の実施

### 4.2 シナリオ2: 脆弱性発見

1. 脆弱性の評価
2. 一時的な対策実施
3. 恒久対策の計画
4. 再発防止策の実装

## 5. セキュリティツール

### 5.1 推奨ツール

- ESLint (セキュリティルール)
- npm audit
- Snyk
- GitGuardian

### 5.2 設定例

```json
// .eslintrc
{
  "extends": ["eslint:recommended", "plugin:security/recommended"],
  "plugins": ["security"],
  "rules": {
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error"
  }
}
```

## 6. 質疑応答とフィードバック

### 6.1 よくある質問

- Q: 開発効率への影響は?
- A: 自動化ツールの活用で最小限に

### 6.2 フィードバック収集

- ガイドラインの改善点
- 追加で必要なトレーニング
- 運用上の課題

## 7. 次のステップ

### 7.1 今後の予定

- 定期的なセキュリティレビュー
- 継続的な教育・訓練
- ガイドラインの更新

### 7.2 サポート体制

- セキュリティチーム連絡先
- 報告フロー
- 技術サポート窓口
