# バリデーションフレームワーク

## 概要

このプロジェクトでは、Zodを使用した共通バリデーションフレームワークを採用しています。
このフレームワークは、フォームのバリデーションルールを一元管理し、一貫性のある入力検証を実現します。

## 基本的な使い方

```typescript
import { commonValidation } from "@/types/validation/commonValidation";

// スキーマの定義
const mySchema = z.object({
  // 必須の文字列フィールド
  name: commonValidation.string.required,

  // 任意の説明フィールド
  description: commonValidation.string.description,

  // 税率フィールド（8-10%）
  taxRate: commonValidation.number.taxRate.default,

  // 日付フィールド
  expiryDate: commonValidation.date.expirationDate(),

  // 配列フィールド（最低1つの要素が必要）
  items: commonValidation.array.nonEmpty(itemSchema),
});
```

## 主要なバリデーションルール

### 数値バリデーション

- `number.taxRate.system`: システム全体での税率の許容範囲（0-100%）
- `number.taxRate.default`: UIでのデフォルト税率範囲（8-10%）
- `number.taxRate.createCustom(min, max)`: カスタム税率範囲の作成

```typescript
// カスタム税率範囲の作成例（5-15%）
const customTaxRate = commonValidation.number.taxRate.createCustom(0.05, 0.15);
```

### 日付バリデーション

- `date.required`: 必須の日付
- `date.optional`: 任意の日付
- `date.expirationDate`: 期限切れチェック用（基準日以降の日付を要求）

```typescript
// 基準日を指定して期限切れチェックを作成
const schema = commonValidation.date.expirationDate(new Date("2025-01-01"));
```

### 文字列バリデーション

- `string.required`: 必須の文字列
- `string.optional`: 任意の文字列
- `string.description`: 説明文用の任意フィールド

### 配列バリデーション

- `array.nonEmpty`: 1つ以上の要素を持つ配列

## エラーメッセージのカスタマイズ

バリデーションエラーメッセージは日本語で提供されます。必要に応じて、個別のスキーマでメッセージをカスタマイズできます：

```typescript
const schema = commonValidation.number.taxRate
  .createCustom(0.05, 0.15)
  .superRefine((val, ctx) => {
    if (val < 0.05) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "カスタムエラーメッセージ",
      });
    }
  });
```

## ベストプラクティス

1. 新しいフォームを作成する際は、必ず共通バリデーションを使用してください。
2. カスタムバリデーションが必要な場合は、共通バリデーションを拡張してください。
3. バリデーションルールの変更が必要な場合は、`commonValidation.ts`を更新してください。
4. 変更を加える際は、必ずテストを更新してください。

## マイグレーションガイド

既存のフォームを新しい共通バリデーションフレームワークに移行する手順：

1. 既存のバリデーションスキーマを特定
2. 対応する共通バリデーションルールに置き換え
3. フォームコンポーネントの更新
4. テストの更新
5. E2Eテストの確認

## 注意事項

- 非推奨の古いバリデーションモジュールは段階的に廃止されます
- 新機能の開発時は必ず新しい共通バリデーションを使用してください
- バリデーションルールの変更は、既存のフォームに影響を与える可能性があるため、慎重に行ってください
