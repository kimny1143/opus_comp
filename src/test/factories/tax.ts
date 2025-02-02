import {
  ViewTaxCalculation,
  ViewTaxSummary,
  TAX_RATES
} from '@/types/base/tax';

/**
 * ViewTaxCalculationのテストデータを生成
 */
export const createTestViewTaxCalculation = (
  overrides: Partial<ViewTaxCalculation> = {}
): ViewTaxCalculation => ({
  rate: TAX_RATES.STANDARD,
  taxRate: TAX_RATES.STANDARD,
  taxableAmount: '2000',
  taxAmount: '200',
  ...overrides
});

/**
 * ViewTaxSummaryのテストデータを生成
 */
export const createTestViewTaxSummary = (
  overrides: Partial<ViewTaxSummary> = {}
): ViewTaxSummary => ({
  byRate: [
    createTestViewTaxCalculation(),
    createTestViewTaxCalculation({
      rate: TAX_RATES.REDUCED,
      taxRate: TAX_RATES.REDUCED,
      taxableAmount: '1000',
      taxAmount: '80'
    })
  ],
  totalTaxableAmount: '3000',
  totalTaxAmount: '280',
  ...overrides
});

/**
 * 複数税率のテストデータを生成
 */
export const createTestMultiRateTaxCalculations = (
  count: number = 2
): ViewTaxCalculation[] => {
  return Array.from({ length: count }, (_, index) =>
    createTestViewTaxCalculation({
      rate: index % 2 === 0 ? TAX_RATES.STANDARD : TAX_RATES.REDUCED,
      taxRate: index % 2 === 0 ? TAX_RATES.STANDARD : TAX_RATES.REDUCED,
      taxableAmount: (1000 * (index + 1)).toString(),
      taxAmount: (1000 * (index + 1) * (index % 2 === 0 ? 0.1 : 0.08)).toString()
    })
  );
};

/**
 * 特定の税率のテストデータを生成
 */
export const createTestTaxCalculationsForRate = (
  rate: number,
  count: number = 2
): ViewTaxCalculation[] => {
  return Array.from({ length: count }, (_, index) =>
    createTestViewTaxCalculation({
      rate,
      taxRate: rate,
      taxableAmount: (1000 * (index + 1)).toString(),
      taxAmount: (1000 * (index + 1) * (rate / 100)).toString()
    })
  );
};

/**
 * カスタム金額のテストデータを生成
 */
export const createTestTaxCalculationWithAmount = (
  amount: number | string,
  rate: number = TAX_RATES.STANDARD
): ViewTaxCalculation => {
  const taxableAmount = amount.toString();
  const taxAmount = (Number(amount) * (rate / 100)).toString();
  
  return createTestViewTaxCalculation({
    rate,
    taxRate: rate,
    taxableAmount,
    taxAmount
  });
};