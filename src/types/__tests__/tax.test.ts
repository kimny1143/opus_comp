import { describe, expect, it } from 'vitest';
import {
  TAX_RATES,
  calculateTax,
  calculateTotalWithTax,
  isReducedTaxItem,
  calculateTaxResult,
  taxRateSchema,
  getTaxRateOptions
} from '../tax';

describe('tax utilities', () => {
  describe('tax rate validation', () => {
    it('should accept valid tax rates', () => {
      const validRates = [
        TAX_RATES.REDUCED,  // 8%
        TAX_RATES.STANDARD  // 10%
      ];

      validRates.forEach(rate => {
        const result = taxRateSchema.safeParse(rate);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid tax rates', () => {
      const invalidRates = [
        0.05,  // 5%
        0.15,  // 15%
        0,     // 0%
        -0.1   // -10%
      ];

      invalidRates.forEach(rate => {
        const result = taxRateSchema.safeParse(rate);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('tax calculations', () => {
    it('should calculate tax amount correctly', () => {
      const testCases = [
        { amount: 1000, rate: TAX_RATES.REDUCED, expected: 80 },   // 1000 * 0.08
        { amount: 1000, rate: TAX_RATES.STANDARD, expected: 100 }, // 1000 * 0.10
        { amount: 1234, rate: TAX_RATES.REDUCED, expected: 99 },   // 1234 * 0.08 (rounded)
        { amount: 1234, rate: TAX_RATES.STANDARD, expected: 123 }  // 1234 * 0.10 (rounded)
      ];

      testCases.forEach(({ amount, rate, expected }) => {
        expect(calculateTax(amount, rate)).toBe(expected);
      });
    });

    it('should calculate total with tax correctly', () => {
      const testCases = [
        { amount: 1000, rate: TAX_RATES.REDUCED, expected: 1080 },   // 1000 + (1000 * 0.08)
        { amount: 1000, rate: TAX_RATES.STANDARD, expected: 1100 },  // 1000 + (1000 * 0.10)
        { amount: 1234, rate: TAX_RATES.REDUCED, expected: 1333 },   // 1234 + (1234 * 0.08)
        { amount: 1234, rate: TAX_RATES.STANDARD, expected: 1357 }   // 1234 + (1234 * 0.10)
      ];

      testCases.forEach(({ amount, rate, expected }) => {
        expect(calculateTotalWithTax(amount, rate)).toBe(expected);
      });
    });
  });

  describe('reduced tax rate determination', () => {
    it('should identify reduced tax rate items correctly', () => {
      const reducedTaxCategories = [
        'FOOD',
        'NEWSPAPER',
        'AGRICULTURE',
        'FISHERY',
        'LIVESTOCK'
      ];

      reducedTaxCategories.forEach(category => {
        expect(isReducedTaxItem(category)).toBe(true);
      });
    });

    it('should identify standard tax rate items correctly', () => {
      const standardTaxCategories = [
        'ELECTRONICS',
        'CLOTHING',
        'FURNITURE',
        'SERVICES',
        'OTHER'
      ];

      standardTaxCategories.forEach(category => {
        expect(isReducedTaxItem(category)).toBe(false);
      });
    });
  });

  describe('tax calculation result', () => {
    it('should calculate full tax result for standard rate items', () => {
      const result = calculateTaxResult(1000, TAX_RATES.STANDARD, 'ELECTRONICS');
      
      expect(result).toEqual({
        subtotal: 1000,
        taxAmount: 100,
        total: 1100,
        taxRate: TAX_RATES.STANDARD,
        isReduced: false
      });
    });

    it('should apply reduced tax rate for eligible items regardless of input rate', () => {
      const result = calculateTaxResult(1000, TAX_RATES.STANDARD, 'FOOD');
      
      expect(result).toEqual({
        subtotal: 1000,
        taxAmount: 80,
        total: 1080,
        taxRate: TAX_RATES.REDUCED,
        isReduced: true
      });
    });

    it('should handle edge cases with zero amount', () => {
      const result = calculateTaxResult(0, TAX_RATES.STANDARD, 'ELECTRONICS');
      
      expect(result).toEqual({
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        taxRate: TAX_RATES.STANDARD,
        isReduced: false
      });
    });
  });

  describe('tax rate options', () => {
    it('should generate correct options for UI', () => {
      const options = getTaxRateOptions();
      
      expect(options).toHaveLength(2);
      expect(options).toContainEqual({
        value: TAX_RATES.REDUCED,
        label: '軽減税率(8%)'
      });
      expect(options).toContainEqual({
        value: TAX_RATES.STANDARD,
        label: '標準税率(10%)'
      });
    });
  });
});