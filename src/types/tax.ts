import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { ItemCategory } from './itemCategory';
import { ViewTaxCalculation, ViewTaxSummary } from '@/types/base/tax';

// 再エクスポート
export type { ViewTaxCalculation as TaxCalculation };
export type { ViewTaxSummary as TaxSummary };

/**
 * 税率の型定義
 */
export type TaxRate = typeof TAX_RATES[keyof typeof TAX_RATES];

/**
 * 税率の定義
 */
export const TAX_RATES = {
  STANDARD: 10,
  REDUCED: 8
} as const;

/**
 * 税率の表示名
 */
export const TAX_RATE_LABELS = {
  [TAX_RATES.STANDARD]: '標準税率(10%)',
  [TAX_RATES.REDUCED]: '軽減税率(8%)'
} as const;

/**
 * 税率のスキーマ
 */
export const taxRateSchema = z.number().refine(
  (rate) => rate === TAX_RATES.STANDARD || rate === TAX_RATES.REDUCED,
  { message: '無効な税率です' }
);

/**
 * 税率の選択オプション
 */
export const getTaxRateOptions = () => [
  { value: TAX_RATES.STANDARD, label: TAX_RATE_LABELS[TAX_RATES.STANDARD] },
  { value: TAX_RATES.REDUCED, label: TAX_RATE_LABELS[TAX_RATES.REDUCED] }
];

/**
 * 軽減税率対象品目かどうかを判定
 */
export const isReducedTaxItem = (category: ItemCategory): boolean => {
  const reducedTaxCategories = [
    ItemCategory.FOOD,
    ItemCategory.NEWSPAPER,
    ItemCategory.AGRICULTURE,
    ItemCategory.FISHERY,
    ItemCategory.LIVESTOCK
  ];
  return reducedTaxCategories.includes(category);
};

/**
 * 税額を計算
 */
export const calculateTax = (amount: number | string, rate: number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (numAmount * (rate / 100)).toString();
};

/**
 * 税込金額を計算
 */
export const calculateTotalWithTax = (amount: number | string, rate: number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (numAmount * (1 + rate / 100)).toString();
};

/**
 * 税率計算の結果を生成
 */
export const calculateTaxResult = (
  amount: number | string,
  rate: number
): ViewTaxCalculation => {
  const taxableAmount = amount.toString();
  const taxAmount = calculateTax(amount, rate);
  return {
    rate,
    taxRate: rate,
    taxableAmount,
    taxAmount
  };
};