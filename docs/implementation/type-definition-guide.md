# 型定義ガイド

## 1. 基本原則

### 1.1 単一ソース・オブ・トゥルース

- 同じ概念の型定義は必ず1箇所で管理
- 型定義は @/types 配下に集約
- レイヤー別の型定義は Base/Db/View の3層構造で管理

### 1.2 命名規則

- ファイル名: キャメルケース (例: purchaseOrder.ts)
- 型名: パスカルケース (例: PurchaseOrder, InvoiceItem)
- レイヤー別の型名: プレフィックスを付与 (例: Base-, Db-, View-)

### 1.3 ディレクトリ構造

```
src/types/
├── base/           # 基本型定義
├── db/             # DB層の型定義
├── view/           # View層の型定義
└── validation/     # バリデーションスキーマ
```

## 2. レイヤー別の型定義ガイドライン

### 2.1 Base層 (@/types/base/)

- 各ドメインの基本的な型定義を格納
- 他のレイヤーの共通基盤となる定義
- nullは使用せず、undefinedを使用

```typescript
// 例: @/types/base/invoice.ts
export interface BaseInvoiceItem {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number | string | Prisma.Decimal;
  taxRate: number | string | Prisma.Decimal;
  description: string;
}
```

### 2.2 DB層 (@/types/db/)

- Prismaモデルに対応する型定義
- 必須フィールドは明確に
- Prisma.Decimalを適切に使用

```typescript
// 例: @/types/db/invoice.ts
export interface DbInvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  description: string;
}
```

### 2.3 View層 (@/types/view/)

- UI/フォームで使用する型定義
- 入力用と表示用を分離
- フロントエンド向けの型変換を考慮

```typescript
// 例: @/types/view/invoice.ts
export interface ViewInvoiceItemInput {
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  description: string;
}

export interface ViewInvoiceItem extends ViewInvoiceItemInput {
  id: string;
}
```

## 3. 型変換ユーティリティ

### 3.1 基本方針

- 各レイヤー間の型変換は専用の関数で実装
- 変換ロジックは一元管理
- デフォルト値の扱いを明確に

```typescript
// 例: Base → View の変換
export const toViewInvoice = (base: BaseInvoice): ViewInvoiceForm => ({
  id: base.id,
  status: base.status,
  // ... 他のフィールド
});
```

### 3.2 エラーハンドリング

- 型変換時のエラーは明確に定義
- 必要に応じてバリデーションを実施
- エラーメッセージは具体的に

## 4. テストデータ生成

### 4.1 ファクトリ関数

- @/test/factories/ に集約
- 各レイヤーのテストデータを生成
- オーバーライド可能な設計

```typescript
// 例: @/test/factories/invoice.ts
export const createTestInvoice = (
  overrides?: Partial<BaseInvoice>
): BaseInvoice => ({
  id: "test-id",
  // ... デフォルト値
  ...overrides,
});
```

## 5. 型の安全性確保

### 5.1 コンパイラ設定

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 5.2 ESLintルール

- @typescript-eslint の推奨ルールを使用
- 型の明示的な指定を推奨
- any型の使用を制限

## 6. メンテナンス

### 6.1 型定義の更新

- 既存の型を変更する場合は影響範囲を確認
- 破壊的変更は段階的に導入
- 変更履歴を適切に記録

### 6.2 レビュー時のチェックポイント

- [ ] 型の重複がないか
- [ ] レイヤー構造が適切か
- [ ] 命名規則に従っているか
- [ ] 必要なテストが追加されているか
- [ ] ドキュメントが更新されているか

## 7. トラブルシューティング

### 7.1 よくある問題と解決策

1. 型の互換性エラー

   - レイヤー間の型変換を確認
   - 必須/オプショナルの定義を確認

2. 循環参照

   - 型定義の依存関係を見直し
   - インターフェースの分割を検討

3. any型の混入
   - 明示的な型定義を追加
   - 型推論の活用を検討

## 8. ベストプラクティス

1. 型定義は可能な限り具体的に
2. ユーティリティ型を活用
3. 共通の型は積極的に再利用
4. 型安全性を重視した設計
5. ドキュメントの継続的な更新
