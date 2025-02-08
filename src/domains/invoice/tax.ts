import { Prisma } from '@prisma/client'
import { TaxableItem, DbTaxSummary, ClientTaxSummary } from '@/types/base/tax'

export const calculateTaxSummary = (items: TaxableItem[]): ClientTaxSummary => {
  const byRate: Record<string, { taxableAmount: number; taxAmount: number }> = {};

  items.forEach(item => {
    const taxRate = item.taxRate.toString();
    const taxableAmount = item.unitPrice * item.quantity;
    const taxAmount = taxableAmount * item.taxRate;

    if (!byRate[taxRate]) {
      byRate[taxRate] = {
        taxableAmount: 0,
        taxAmount: 0
      };
    }

    byRate[taxRate].taxableAmount += taxableAmount;
    byRate[taxRate].taxAmount += taxAmount;
  });

  const totalTaxableAmount = Object.values(byRate).reduce(
    (sum, { taxableAmount }) => sum + taxableAmount,
    0
  );

  const totalTaxAmount = Object.values(byRate).reduce(
    (sum, { taxAmount }) => sum + taxAmount,
    0
  );

  return {
    byRate,
    totalTaxableAmount,
    totalTaxAmount
  };
};

export const calculateDbTaxSummary = (items: Array<{
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: number;
}>): DbTaxSummary => {
  const byRate: Record<string, { taxableAmount: Prisma.Decimal; taxAmount: Prisma.Decimal }> = {};

  items.forEach(item => {
    const taxRate = item.taxRate.toString();
    const taxableAmount = item.unitPrice.mul(item.quantity);
    const taxAmount = taxableAmount.mul(new Prisma.Decimal(item.taxRate));

    if (!byRate[taxRate]) {
      byRate[taxRate] = {
        taxableAmount: new Prisma.Decimal(0),
        taxAmount: new Prisma.Decimal(0)
      };
    }

    byRate[taxRate].taxableAmount = byRate[taxRate].taxableAmount.add(taxableAmount);
    byRate[taxRate].taxAmount = byRate[taxRate].taxAmount.add(taxAmount);
  });

  const totalTaxableAmount = Object.values(byRate).reduce(
    (sum, { taxableAmount }) => sum.add(taxableAmount),
    new Prisma.Decimal(0)
  );

  const totalTaxAmount = Object.values(byRate).reduce(
    (sum, { taxAmount }) => sum.add(taxAmount),
    new Prisma.Decimal(0)
  );

  return {
    byRate,
    totalTaxableAmount,
    totalTaxAmount
  };
};

export const convertTaxRateToPercent = (taxRate: number | string): string => {
  const rate = typeof taxRate === 'string' ? Number(taxRate) : taxRate;
  return `${(rate * 100).toFixed(1)}%`;
};