import { z } from 'zod';
import { getMessage } from './validation/messages';

/**
 * 税率の定義
 */
export const TAX_RATES = {
  REDUCED: 0.08,  // 軽減税率(8%)
  STANDARD: 0.10  // 標準税率(10%)
} as const;

export type TaxRate = typeof TAX_RATES[keyof typeof TAX_RATES];

/**
 * 税率の表示名
 */
export const TAX_RATE_LABELS: Record<TaxRate, string> = {
  [TAX_RATES.REDUCED]: '軽減税率(8%)',
  [TAX_RATES.STANDARD]: '標準税率(10%)'
};

/**
 * 軽減税率対象の判定
 */
export const isReducedTaxItem = (category: string): boolean => {
  // 軽減税率対象カテゴリー
  const REDUCED_TAX_CATEGORIES = [
    'FOOD',          // 飲食料品
    'NEWSPAPER',     // 定期購読の新聞
    'AGRICULTURE',   // 農産品
    'FISHERY',       // 水産品
    'LIVESTOCK'      // 畜産品
  ];

  return REDUCED_TAX_CATEGORIES.includes(category);
};

/**
 * 税率の計算
 */
export const calculateTax = (amount: number, taxRate: TaxRate): number => {
  return Math.round(amount * taxRate);
};

/**
 * 税込金額の計算
 */
export const calculateTotalWithTax = (amount: number, taxRate: TaxRate): number => {
  return amount + calculateTax(amount, taxRate);
};

/**
 * 税率のバリデーションスキーマ
 */
export const taxRateSchema = z.number()
  .refine(
    (value): value is TaxRate => 
      Object.values(TAX_RATES).includes(value as TaxRate),
    {
      message: getMessage('taxRate')
    }
  );

/**
 * 税率選択オプションの生成
 */
export const getTaxRateOptions = () => 
  Object.entries(TAX_RATES).map(([key, value]) => ({
    value,
    label: TAX_RATE_LABELS[value]
  }));

/**
 * 税率計算結果の型
 */
export interface TaxCalculationResult {
  subtotal: number;      // 税抜金額
  taxAmount: number;     // 消費税額
  total: number;         // 税込合計
  taxRate: TaxRate;      // 適用税率
  isReduced: boolean;    // 軽減税率適用有無
}

/**
 * 税率計算
 */
export const calculateTaxResult = (
  amount: number,
  taxRate: TaxRate,
  category: string
): TaxCalculationResult => {
  const isReduced = isReducedTaxItem(category);
  const actualTaxRate = isReduced ? TAX_RATES.REDUCED : taxRate;
  const taxAmount = calculateTax(amount, actualTaxRate);

  return {
    subtotal: amount,
    taxAmount,
    total: amount + taxAmount,
    taxRate: actualTaxRate,
    isReduced
  };
};