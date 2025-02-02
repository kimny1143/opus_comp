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

### 4.1 型安全性

- 明示的な型キャストの禁止
- unknown経由の型変換の最小化
- 共通型の使用を強制

### 4.2 テスト要件

- ファクトリ関数のカバレッジ100%
- 型変換テストの完備
- エッジケースの網羅

### 4.3 コード品質

- ESLint strict modeの有効化
- 型定義ファイルの整理
- 命名規則の統一

## 5. リスク管理

### 5.1 移行リスク

- 既存コードへの影響
- テストの破損可能性
- 型エラーの一時的な増加

### 5.2 対策

- 段階的な移行
- テストの並行実行
- リグレッションテストの強化

## 6. ドキュメント

### 6.1 型定義ガイド

- 基本型の説明
- レイヤー別の使い分け
- 変換ルール

### 6.2 テストガイド

- ファクトリ関数の使用方法
- テストデータの作成ルール
- 型チェックの方法

この計画は、型の不整合を根本的に解決し、プロジェクト全体で一貫性のある型システムを確立することを目指します。
すべてのフェーズが完了し、型システムの改善が達成されました。
