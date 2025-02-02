# 型システムの改善計画 (2025/2/3)

## 1. 現状の課題

### 1.1 型の不整合

1. InvoicePreviewModal.test.tsx

   - TaxCalculationの型定義が不完全
   - テストデータと実際の型が不一致

2. メール送信機能

   - MailContextのジェネリック型の制約が不適切
   - MailTemplateの型定義が不完全

3. PDF生成機能

   - QualifiedInvoiceItemの型定義が不完全
   - categoryプロパティの扱いが不統一

4. Prismaモデル
   - itemCategoryMasterの定義が不足
   - モデル名の不一致

## 2. 対応方針

### 2.1 型定義の統一

1. Invoice関連

   ```typescript
   // 共通の基本型を定義
   interface BaseTaxCalculation {
     rate: number;
     taxRate: number;
     taxableAmount: string | Prisma.Decimal;
     taxAmount: string | Prisma.Decimal;
   }

   // 用途別の具体的な型を定義
   interface ViewTaxCalculation extends BaseTaxCalculation {
     taxableAmount: string;
     taxAmount: string;
   }

   interface DbTaxCalculation extends BaseTaxCalculation {
     taxableAmount: Prisma.Decimal;
     taxAmount: Prisma.Decimal;
   }
   ```

2. Mail関連

   ```typescript
   interface MailContext<T extends keyof MailTemplateMap> {
     to: string;
     subject: string;
     data: MailTemplateMap[T];
   }

   interface MailTemplateMap {
     invoiceCreated: {
       invoice: QualifiedInvoice;
       companyInfo: CompanyInfo;
     };
     // 他のテンプレート型...
   }
   ```

### 2.2 変換関数の整備

1. 型変換ユーティリティ

   - string ⇔ Decimal
   - View型 ⇔ DB型
   - テストデータ生成

2. バリデーション
   - zodスキーマの整備
   - 実行時型チェックの強化

### 2.3 テストデータの改善

1. ファクトリ関数

   - 型安全なモックデータ生成
   - 必須フィールドの保証
   - 一貫性のある変換処理

2. テストヘルパー
   - 共通のセットアップ処理
   - 型チェック用アサーション

## 3. 実装手順

### Phase 1: 基盤整備 (2/3 - 2/4)

1. 共通型定義の作成

   - [ ] BaseTaxCalculation
   - [ ] MailTemplateMap
   - [ ] 変換ユーティリティ

2. Prismaスキーマの更新
   - [ ] itemCategory モデルの定義
   - [ ] マイグレーション作成
   - [ ] 型生成の確認

### Phase 2: コンポーネント修正 (2/5 - 2/6)

1. InvoicePreviewModal

   - [ ] テストデータの型修正
   - [ ] モック生成関数の改善
   - [ ] 型アサーションの見直し

2. メール機能
   - [ ] MailTemplate型の再定義
   - [ ] invoiceCreatedの型対応
   - [ ] テストケースの更新

### Phase 3: テスト強化 (2/7)

1. テストユーティリティ
   - [ ] 型安全なモックファクトリ
   - [ ] カスタムマッチャー
   - [ ] 型チェックヘルパー

## 4. 品質基準

1. 型安全性

   - 明示的な型アサーションの最小化
   - 実行時型チェックの導入
   - 型定義の自動テスト

2. テストカバレッジ

   - 型変換関数: 100%
   - バリデーション: 100%
   - エッジケース: 90%

3. コード品質
   - ESLintの型チェック有効化
   - 型定義の重複排除
   - 命名規則の統一

## 5. リスク管理

1. 互換性の維持

   - 既存コードへの影響を最小化
   - 段階的な移行計画
   - 型の後方互換性確保

2. パフォーマンス
   - 型チェックのオーバーヘッド
   - バンドルサイズへの影響
   - 実行時コストの評価

## 6. 承認依頼事項

1. 型システムの設計方針

   - 基本型定義の妥当性
   - 変換戦略の適切性
   - テスト方針の十分性

2. 移行計画
   - 段階的実装の順序
   - 優先順位の設定
   - リスク対策の評価

この計画は、現在発生している型の問題に対する包括的な解決策を提案するものです。
承認いただければ、Phase 1から順次実装を進めていきたいと考えています。
