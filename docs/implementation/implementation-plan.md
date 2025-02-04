# 型システムの改善計画 (2025/2/3)

## 1. 現状の課題

### 1.1 型定義の重複と不整合

- 同じ概念(TaxCalculation等)の型が複数のファイルで異なる定義
- ビュー層とDB層での型の不一致(string vs Decimal)
- テストデータと実装の型の食い違い

### 1.2 問題のある箇所

1. InvoicePreviewModal.test.tsx

   - taxSummary.byRateの型不整合 ✅
   - テストデータの型が実装と不一致 ✅

2. メール送信機能

   - MailContextのジェネリック型制約が不適切 ✅
   - テンプレート型の定義が不完全 ✅

3. PDF生成機能
   - QualifiedInvoiceItemの型定義が不完全 ✅
   - categoryプロパティの扱いが不統一 ✅

## 2. 改善方針

### 2.1 単一ソース・オブ・トゥルース

1. 基本型定義の集約 ✅

   ```typescript
   // @/types/base/tax.ts
   export interface BaseTaxCalculation {
     rate: number;
     taxableAmount: string | Prisma.Decimal;
     taxAmount: string | Prisma.Decimal;
   }
   ```

2. レイヤー別の型定義 ✅

   ```typescript
   // @/types/view/tax.ts
   export interface ViewTaxCalculation
     extends Omit<BaseTaxCalculation, "taxableAmount" | "taxAmount"> {
     taxableAmount: string;
     taxAmount: string;
   }

   // @/types/db/tax.ts
   export interface DbTaxCalculation
     extends Omit<BaseTaxCalculation, "taxableAmount" | "taxAmount"> {
     taxableAmount: Prisma.Decimal;
     taxAmount: Prisma.Decimal;
   }
   ```

### 2.2 型変換の一元管理 ✅

1. 変換ユーティリティ

   ```typescript
   // @/utils/typeConverters.ts
   export const toViewTaxCalculation = (
     db: DbTaxCalculation
   ): ViewTaxCalculation => ({
     ...db,
     taxableAmount: db.taxableAmount.toString(),
     taxAmount: db.taxAmount.toString(),
   });

   export const toDbTaxCalculation = (
     view: ViewTaxCalculation
   ): DbTaxCalculation => ({
     ...view,
     taxableAmount: new Prisma.Decimal(view.taxableAmount),
     taxAmount: new Prisma.Decimal(view.taxAmount),
   });
   ```

2. テストデータ生成 ✅
   ```typescript
   // @/test/factories/tax.ts
   export const createTestTaxCalculation = (
     overrides?: Partial<ViewTaxCalculation>
   ): ViewTaxCalculation => ({
     rate: 10,
     taxableAmount: "2000",
     taxAmount: "200",
     ...overrides,
   });
   ```

## 3. 実装計画

### Phase 1: 型定義の整理 (2/3) ✅

1. 基本型の定義

   - [x] @/types/base/配下に基本型を集約
   - [x] レイヤー別の型を定義(view/db)
   - [x] 型変換ユーティリティの作成

2. テストデータ生成の統一
   - [x] @/test/factories/配下にファクトリ関数を集約
   - [x] ViewTaxCalculation形式に統一
   - [x] 既存テストの修正

### Phase 2: コンポーネントの修正 (2/4) ✅

1. InvoicePreviewModal

   - [x] テストデータをファクトリ関数に置き換え
   - [x] 型キャストの除去
   - [x] バリデーションの追加

2. メール機能
   - [x] MailContextのジェネリック制約追加
   - [x] テンプレート型の再定義
   - [x] 型安全な実装に修正

### Phase 3: PDF機能の改善 (2/5) ✅

1. 型の整理

   - [x] QualifiedInvoiceItemの完全な定義
   - [x] categoryプロパティの扱いを決定
   - [x] 変換ロジックの実装

2. テストの強化
   - [x] 型チェックの追加
   - [x] エッジケースのテスト
   - [x] 変換テストの追加

## 4. 品質基準

### 4.1 型安全性 ✅

- 明示的な型キャストの禁止
- unknown経由の型変換の最小化
- 共通型の使用を強制

### 4.2 テスト要件 ✅

- ファクトリ関数のカバレッジ100%
- 型変換テストの完備
- エッジケースの網羅

### 4.3 コード品質 ✅

- ESLint strict modeの有効化
- 型定義ファイルの整理
- 命名規則の統一

## 5. リスク管理

### 5.1 移行リスク

- 既存コードへの影響
- テストの破損可能性
- 型エラーの一時的な増加

### 5.2 対策 ✅

- 段階的な移行を実施
- テストの並行実行を確認
- リグレッションテストを強化

## 6. ドキュメント

### 6.1 型定義ガイド ✅

- 基本型の説明を追加
- レイヤー別の使い分けを明確化
- 変換ルールを文書化

### 6.2 テストガイド ✅

- ファクトリ関数の使用方法を整備
- テストデータの作成ルールを統一
- 型チェックの方法を文書化

## 7. 成果

### 7.1 型システムの改善 ✅

1. 型定義の整理

   - 基本型の集約と一元管理を完了
   - レイヤー別の型定義を整理
   - 型変換ユーティリティを整備

2. コンポーネントの改善

   - InvoicePreviewModalの型安全性を向上
   - メールテンプレートの型定義を強化
   - PDF生成機能を拡張

3. テストの強化

   - テストファクトリを統一
   - エラーケースのテストを追加
   - バリデーション機能を追加

4. リンターエラーの解消
   - 型の不一致を修正
   - 不適切な型キャストを除去
   - 型定義の漏れを補完

### 7.2 税率計算の改善 ✅

1. 計算ロジックの修正

   - 税率を8%(軽減税率)と10%(標準税率)のみに制限
   - 数量0のアイテムを計算から除外
   - 税率の高い順にソートする処理を追加
   - Math.floorによる端数切り捨て処理を追加

2. バリデーション強化

   - 税率の範囲チェック(8%または10%)を追加
   - 軽減税率(8%)適用時の説明必須化
   - エラーメッセージの明確化と統一

3. テストの充実
   - ユニットテストの追加(エッジケース含む)
   - E2Eテストでの動作確認
   - テストケースの整理と改善

この計画は、型の不整合を根本的に解決し、プロジェクト全体で一貫性のある型システムを確立することを目指しました。
すべてのフェーズが完了し、型システムの改善が達成されました。
また、税率計算機能の改善により、インボイス制度に準拠した正確な計算処理が実現されました。
