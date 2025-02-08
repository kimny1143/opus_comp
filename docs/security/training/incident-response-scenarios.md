# インシデント対応机上訓練シナリオ集

## 1. 訓練の目的

- インシデント対応フローの実践的理解
- チーム連携の強化
- 対応スキルの向上
- コミュニケーションの改善

## 2. シナリオ1: 不正アクセスの検知

### 2.1 状況設定

```text
日時: 2025年2月8日 14:30
検知内容: 管理画面への複数回の不正ログイン試行
影響範囲: 認証システム全般
リスクレベル: 中
```

### 2.2 初期情報

```json
{
  "検知システム": "WAF",
  "アラート内容": "複数回の認証失敗",
  "IPアドレス": "203.0.113.1",
  "対象URL": "/admin/login",
  "試行回数": "50回/5分"
}
```

### 2.3 対応手順演習

1. 初動対応

   - アラートの確認
   - セキュリティ管理者への報告
   - 影響範囲の特定

2. 技術的対応

```typescript
// 実装例: IPブロック
async function blockSuspiciousIP(ip: string) {
  await waf.addBlockRule({
    ipAddress: ip,
    duration: "24h",
    reason: "Excessive login attempts",
  });
}

// 実装例: セッション無効化
async function invalidateSuspiciousSessions() {
  await redis.del("session:*");
  await notifyActiveUsers("セキュリティのため再ログインが必要です");
}
```

## 3. シナリオ2: 脆弱性の報告

### 3.1 状況設定

```text
日時: 2025年2月8日 16:45
報告内容: 特定APIエンドポイントでのSQLインジェクションの可能性
影響範囲: ユーザーデータ取得API
リスクレベル: 高
```

### 3.2 初期情報

```typescript
// 脆弱性のある実装
app.get("/api/users", (req, res) => {
  const query = `SELECT * FROM users WHERE role = '${req.query.role}'`;
  db.query(query).then((users) => res.json(users));
});
```

### 3.3 対応手順演習

1. 初動対応

   - 脆弱性の確認
   - 一時的な対策実施
   - 開発チームへの報告

2. 技術的対応

```typescript
// 修正実装
app.get("/api/users", async (req, res) => {
  try {
    const query = "SELECT * FROM users WHERE role = ?";
    const users = await db.query(query, [req.query.role]);
    res.json(users);
  } catch (error) {
    logger.error("User query error:", error);
    res.status(500).send("Internal Server Error");
  }
});
```

## 4. シナリオ3: 依存パッケージの脆弱性

### 4.1 状況設定

```text
日時: 2025年2月8日 10:15
検知内容: npm auditによる重大な脆弱性の検出
影響範囲: プロダクション環境
リスクレベル: 高
```

### 4.2 初期情報

```json
{
  "パッケージ名": "critical-dependency",
  "バージョン": "1.2.3",
  "脆弱性種別": "Remote Code Execution",
  "CVE番号": "CVE-2025-1234"
}
```

### 4.3 対応手順演習

1. 初動対応

   - 影響範囲の特定
   - 一時的な対策検討
   - 更新計画の立案

2. 技術的対応

```bash
# 脆弱性の詳細確認
npm audit

# パッケージの更新
npm update critical-dependency

# 依存関係の検証
npm test
```

## 5. シナリオ4: データ漏洩インシデント

### 5.1 状況設定

```text
日時: 2025年2月8日 09:00
検知内容: 機密情報を含むログファイルの誤った公開
影響範囲: 顧客データ
リスクレベル: 重大
```

### 5.2 初期情報

```json
{
  "対象ファイル": "/var/log/app/debug.log",
  "公開期間": "約2時間",
  "データ種別": "個人情報を含むデバッグログ",
  "アクセス数": "不明"
}
```

### 5.3 対応手順演習

1. 初動対応

   - 即時の公開停止
   - 上級管理者への報告
   - 影響調査の開始

2. 技術的対応

```typescript
// ログ設定の修正
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      // 機密情報のマスク処理
      format: winston.format.combine(
        winston.format.maskSecrets(),
        winston.format.json()
      ),
    }),
  ],
});
```

## 6. 評価基準

### 6.1 対応時間

- 初動対応: 15分以内
- 技術的対応: 30分以内
- 報告完了: 60分以内

### 6.2 評価項目

- 手順の遵守
- 情報の正確性
- チーム連携
- 文書化の質

## 7. フィードバック

### 7.1 振り返り項目

- 対応の適切性
- 時間管理
- コミュニケーション
- 改善点の特定

### 7.2 報告書作成

```markdown
# インシデント対応報告書

## 基本情報

- インシデント種別:
- 発生日時:
- 対応完了時間:
- 対応者:

## 対応内容

1. 初動対応
2. 技術的対応
3. 再発防止策

## 教訓と改善点

-
```
