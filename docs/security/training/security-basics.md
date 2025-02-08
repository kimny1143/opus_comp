# セキュリティ基礎教育 実践ガイド

## 1. セキュリティの基本概念

### 1.1 セキュリティの3要素

- 機密性 (Confidentiality)
- 完全性 (Integrity)
- 可用性 (Availability)

### 1.2 主な脅威

- 不正アクセス
- データ漏洩
- マルウェア
- DoS攻撃
- ソーシャルエンジニアリング

## 2. 実践演習

### 演習1: 脆弱性の特定と対策

#### 2.1 コード診断

```typescript
// 脆弱なコード例
app.get("/user/:id", (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query).then((user) => res.json(user));
});

// 修正例
app.get("/user/:id", (req, res) => {
  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [req.params.id]).then((user) => res.json(user));
});
```

#### 2.2 演習タスク

1. 上記コードの脆弱性を特定
2. 対策の実装
3. テストケースの作成

### 演習2: セキュアな設定

#### 2.3 環境変数

```bash
# 悪い例
DATABASE_URL=mysql://root:password@localhost:3306/db

# 良い例
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

#### 2.4 演習タスク

1. .env.exampleの作成
2. 環境変数の暗号化
3. 設定ファイルのレビュー

### 演習3: 依存関係の管理

#### 2.5 パッケージ監査

```bash
# 基本的な監査
npm audit

# 詳細な監査レポート
npm audit --json

# 自動修正
npm audit fix
```

#### 2.6 演習タスク

1. 現在の依存関係の監査
2. 脆弱性の特定と分類
3. 修正計画の立案

## 3. セキュアコーディング実践

### 3.1 入力検証

```typescript
// 悪い例
function processUserInput(input: string) {
  return input.replace(/<script>/g, "");
}

// 良い例
import { sanitize } from "sanitize-html";

function processUserInput(input: string) {
  return sanitize(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
```

### 3.2 認証・認可

```typescript
// 悪い例
function isAdmin(user) {
  return user.role === "admin";
}

// 良い例
function isAdmin(user) {
  return user?.roles?.includes("admin") ?? false;
}
```

### 3.3 エラー処理

```typescript
// 悪い例
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.message);
});

// 良い例
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
  // 詳細はログに記録
  logger.error({
    error: err,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
    },
  });
});
```

## 4. セキュリティテスト

### 4.1 ユニットテスト

```typescript
describe("User Authentication", () => {
  it("should prevent SQL injection", async () => {
    const maliciousInput = "' OR '1'='1";
    const result = await auth.validateUser(maliciousInput);
    expect(result).toBe(null);
  });
});
```

### 4.2 統合テスト

```typescript
describe("API Security", () => {
  it("should require authentication", async () => {
    const response = await request(app).get("/api/sensitive-data");
    expect(response.status).toBe(401);
  });
});
```

## 5. インシデント対応演習

### 5.1 シナリオベース訓練

1. 不正アクセスの検知
2. 初動対応
3. 影響範囲の特定
4. 対策の実施
5. 報告書の作成

### 5.2 実践的な対応手順

```typescript
// インシデント対応のコード例
async function handleSecurityIncident(incident: SecurityIncident) {
  // 1. ログの保全
  await preserveSystemLogs();

  // 2. 影響を受けたシステムの隔離
  await isolateAffectedSystems(incident.affectedSystems);

  // 3. 証拠の収集
  const evidence = await collectEvidence(incident);

  // 4. 初期レポートの作成
  await createIncidentReport(incident, evidence);

  // 5. 関係者への通知
  await notifyStakeholders(incident);
}
```

## 6. 評価とフィードバック

### 6.1 理解度チェック

- セキュリティの基本概念
- 実践的なコーディング
- インシデント対応手順
- テスト方法

### 6.2 フィードバックフォーム

- 教材の改善点
- 追加で必要なトピック
- 実践での課題

## 7. 参考リソース

### 7.1 推奨文献

- OWASP Top 10
- NIST Cybersecurity Framework
- セキュアコーディングガイドライン

### 7.2 ツール

- ESLint (セキュリティプラグイン)
- SonarQube
- Snyk
- OWASP ZAP
