import { describe, expect, it } from 'vitest';
import {
  TAX_RATES,
  isReducedTaxItem,
  calculateTax,
  calculateTotalWithTax,
  calculateTaxResult,
  taxRateSchema,
  getTaxRateOptions
} from '../tax';
import { ItemCategory } from '../itemCategory';

describe('tax utilities', () => {
  describe('taxRateSchema', () => {
    it('should validate standard tax rate', () => {
      const result = taxRateSchema.safeParse(10);
      expect(result.success).toBe(true);
    });

    it('should validate reduced tax rate', () => {
      const result = taxRateSchema.safeParse(8);
      expect(result.success).toBe(true);
    });

    it('should reject invalid tax rate', () => {
      const result = taxRateSchema.safeParse(5);
      expect(result.success).toBe(false);
    });
  });

  describe('getTaxRateOptions', () => {
    it('should return tax rate options', () => {
      const options = getTaxRateOptions();
      expect(options).toHaveLength(2);
      expect(options).toEqual([
        { value: 10, label: '標準税率(10%)' },
        { value: 8, label: '軽減税率(8%)' }
      ]);
    });
  });

  describe('isReducedTaxItem', () => {
    it('should return true for food items', () => {
      expect(isReducedTaxItem(ItemCategory.FOOD)).toBe(true);
    });

    it('should return true for newspaper', () => {
      expect(isReducedTaxItem(ItemCategory.NEWSPAPER)).toBe(true);
    });

    it('should return true for agriculture products', () => {
      expect(isReducedTaxItem(ItemCategory.AGRICULTURE)).toBe(true);
    });

    it('should return true for fishery products', () => {
      expect(isReducedTaxItem(ItemCategory.FISHERY)).toBe(true);
    });

    it('should return true for livestock products', () => {
      expect(isReducedTaxItem(ItemCategory.LIVESTOCK)).toBe(true);
    });

    it('should return false for electronics', () => {
      expect(isReducedTaxItem(ItemCategory.ELECTRONICS)).toBe(false);
    });

    it('should return false for services', () => {
      expect(isReducedTaxItem(ItemCategory.SERVICES)).toBe(false);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax amount for standard rate', () => {
      expect(calculateTax(1000, TAX_RATES.STANDARD)).toBe('100');
    });

    it('should calculate tax amount for reduced rate', () => {
      expect(calculateTax(1000, TAX_RATES.REDUCED)).toBe('80');
    });

    it('should handle string input', () => {
      expect(calculateTax('1000', TAX_RATES.STANDARD)).toBe('100');
    });
  });

  describe('calculateTotalWithTax', () => {
    it('should calculate total with standard tax', () => {
      expect(calculateTotalWithTax(1000, TAX_RATES.STANDARD)).toBe('1100');
    });

    it('should calculate total with reduced tax', () => {
      expect(calculateTotalWithTax(1000, TAX_RATES.REDUCED)).toBe('1080');
    });

    it('should handle string input', () => {
      expect(calculateTotalWithTax('1000', TAX_RATES.STANDARD)).toBe('1100');
    });
  });

  describe('calculateTaxResult', () => {
    it('should return tax calculation result for standard rate', () => {
      const result = calculateTaxResult(1000, TAX_RATES.STANDARD);
      expect(result).toEqual({
        rate: 10,
        taxRate: 10,
        taxableAmount: '1000',
        taxAmount: '100'
      });
    });

    it('should return tax calculation result for reduced rate', () => {
      const result = calculateTaxResult(1000, TAX_RATES.REDUCED);
      expect(result).toEqual({
        rate: 8,
        taxRate: 8,
        taxableAmount: '1000',
        taxAmount: '80'
      });
    });

    it('should handle string input', () => {
      const result = calculateTaxResult('1000', TAX_RATES.STANDARD);
      expect(result).toEqual({
        rate: 10,
        taxRate: 10,
        taxableAmount: '1000',
        taxAmount: '100'
      });
    });
  });
});