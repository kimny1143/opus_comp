import { Prisma } from '@prisma/client';

/**
 * 税率計算の基本型定義
 * この型は他の型定義のベースとなり、string | Decimal の共用型を持つ
 */
export interface BaseTaxCalculation {
  rate: number;
  taxRate: number;  // 互換性のために残す
  taxableAmount: string | Prisma.Decimal;
  taxAmount: string | Prisma.Decimal;
}

/**
 * ビュー層用の税率計算型
 * フロントエンドやテストで使用する、文字列ベースの型
 */
export interface ViewTaxCalculation extends Omit<BaseTaxCalculation, 'taxableAmount' | 'taxAmount'> {
  taxableAmount: string;
  taxAmount: string;
}

/**
 * DB層用の税率計算型
 * Prismaモデルで使用する、Decimal型ベースの型
 */
export interface DbTaxCalculation extends Omit<BaseTaxCalculation, 'taxableAmount' | 'taxAmount'> {
  taxableAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
}

/**
 * 税率の定義
 */
export const TAX_RATES = {
  STANDARD: 10,
  REDUCED: 8
} as const;

export type TaxRate = typeof TAX_RATES[keyof typeof TAX_RATES];

/**
 * 税率の表示名
 */
export const TAX_RATE_LABELS = {
  [TAX_RATES.STANDARD]: '標準税率(10%)',
  [TAX_RATES.REDUCED]: '軽減税率(8%)'
} as const;

/**
 * 税率サマリーの基本型
 */
export interface BaseTaxSummary {
  byRate: BaseTaxCalculation[];
  totalTaxableAmount: string | Prisma.Decimal;
  totalTaxAmount: string | Prisma.Decimal;
}

/**
 * ビュー層用の税率サマリー型
 */
export interface ViewTaxSummary extends Omit<BaseTaxSummary, 'byRate' | 'totalTaxableAmount' | 'totalTaxAmount'> {
  byRate: ViewTaxCalculation[];
  totalTaxableAmount: string;
  totalTaxAmount: string;
}

/**
 * DB層用の税率サマリー型
 */
export interface DbTaxSummary extends Omit<BaseTaxSummary, 'byRate' | 'totalTaxableAmount' | 'totalTaxAmount'> {
  byRate: DbTaxCalculation[];
  totalTaxableAmount: Prisma.Decimal;
  totalTaxAmount: Prisma.Decimal;
}