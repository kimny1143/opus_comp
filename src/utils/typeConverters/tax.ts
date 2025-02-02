import { Prisma } from '@prisma/client';
import {
  ViewTaxCalculation,
  DbTaxCalculation,
  ViewTaxSummary,
  DbTaxSummary
} from '@/types/base/tax';

/**
 * 文字列をDecimal型に変換
 */
const toDecimal = (value: string | number): Prisma.Decimal => {
  if (typeof value === 'string') {
    return new Prisma.Decimal(value);
  }
  return new Prisma.Decimal(value.toString());
};

/**
 * ViewTaxCalculationをDB層の型に変換
 */
export const toDbTaxCalculation = (view: ViewTaxCalculation): DbTaxCalculation => ({
  rate: view.rate,
  taxRate: view.taxRate,
  taxableAmount: toDecimal(view.taxableAmount),
  taxAmount: toDecimal(view.taxAmount)
});

/**
 * DbTaxCalculationをView層の型に変換
 */
export const toViewTaxCalculation = (db: DbTaxCalculation): ViewTaxCalculation => ({
  rate: db.rate,
  taxRate: db.taxRate,
  taxableAmount: db.taxableAmount.toString(),
  taxAmount: db.taxAmount.toString()
});

/**
 * ViewTaxSummaryをDB層の型に変換
 */
export const toDbTaxSummary = (view: ViewTaxSummary): DbTaxSummary => ({
  byRate: view.byRate.map(toDbTaxCalculation),
  totalTaxableAmount: toDecimal(view.totalTaxableAmount),
  totalTaxAmount: toDecimal(view.totalTaxAmount)
});

/**
 * DbTaxSummaryをView層の型に変換
 */
export const toViewTaxSummary = (db: DbTaxSummary): ViewTaxSummary => ({
  byRate: db.byRate.map(toViewTaxCalculation),
  totalTaxableAmount: db.totalTaxableAmount.toString(),
  totalTaxAmount: db.totalTaxAmount.toString()
});

/**
 * 税額を計算
 */
export const calculateTax = (amount: string | number, rate: number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (numAmount * (rate / 100)).toString();
};

/**
 * 税込金額を計算
 */
export const calculateTotalWithTax = (amount: string | number, rate: number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (numAmount * (1 + rate / 100)).toString();
};

/**
 * ViewTaxCalculationを生成
 */
export const createViewTaxCalculation = (
  amount: string | number,
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