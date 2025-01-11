import { calculateTaxByRate, calculateItemTax, TaxableItem, convertTaxRateToDecimal, convertTaxRateToPercent } from '../tax'
import { TaxCalculation, InvoiceTaxSummary } from '../types'

describe('tax calculation', () => {
  describe('calculateItemTax', () => {
    it('should calculate tax for single item with 10% tax rate', () => {
      const item: TaxableItem = {
        unitPrice: '1000',
        quantity: 1,
        taxRate: 0.1
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(1000)
      expect(result.taxAmount).toBe(100)
    })

    it('should calculate tax for single item with 8% tax rate', () => {
      const item: TaxableItem = {
        unitPrice: '1000',
        quantity: 2,
        taxRate: 0.08
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(2000)
      expect(result.taxAmount).toBe(160)
    })

    it('should handle 0% tax rate', () => {
      const item: TaxableItem = {
        unitPrice: '1000',
        quantity: 1,
        taxRate: 0
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(1000)
      expect(result.taxAmount).toBe(0)
    })

    it('should handle decimal prices', () => {
      const item: TaxableItem = {
        unitPrice: '1000.5',
        quantity: 1,
        taxRate: 0.1
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(1000)  // Math.floor適用
      expect(result.taxAmount).toBe(100)
    })

    it('should handle edge cases for rounding', () => {
      const item: TaxableItem = {
        unitPrice: '1333',
        quantity: 1,
        taxRate: 0.1
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(1333)
      expect(result.taxAmount).toBe(133)  // 133.3 → 133（切り捨て）
    })

    it('should handle large numbers correctly', () => {
      const item: TaxableItem = {
        unitPrice: '9999999',
        quantity: 1,
        taxRate: 0.1
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(9999999)
      expect(result.taxAmount).toBe(999999)
    })
  })

  describe('calculateTaxByRate', () => {
    it('should calculate tax for multiple items with different rates', () => {
      const items: TaxableItem[] = [
        { unitPrice: '1000', quantity: 1, taxRate: 0.1 },
        { unitPrice: '2000', quantity: 1, taxRate: 0.08 },
        { unitPrice: '3000', quantity: 1, taxRate: 0 }
      ]
      const result = calculateTaxByRate(items)
      const expected: TaxCalculation[] = [
        { taxRate: 0.1, taxableAmount: 1000, taxAmount: 100 },
        { taxRate: 0.08, taxableAmount: 2000, taxAmount: 160 },
        { taxRate: 0, taxableAmount: 3000, taxAmount: 0 }
      ]
      expect(result.byRate).toEqual(expected)
      expect(result.totalTaxAmount).toBe(260)
      expect(result.totalTaxableAmount).toBe(6000)
    })

    it('should handle empty items array', () => {
      const result = calculateTaxByRate([])
      expect(result.byRate).toEqual([])
      expect(result.totalTaxAmount).toBe(0)
    })

    it('should aggregate items with same tax rate', () => {
      const items: TaxableItem[] = [
        { unitPrice: '1000', quantity: 1, taxRate: 0.1 },
        { unitPrice: '2000', quantity: 1, taxRate: 0.1 }
      ]
      const result = calculateTaxByRate(items)
      expect(result.byRate).toEqual([
        { rate: 0.1, taxableAmount: 3000, taxAmount: 300 }
      ])
    })

    it('should handle multiple items with mixed tax rates', () => {
      const items: TaxableItem[] = [
        { unitPrice: '1000', quantity: 2, taxRate: 0.1 },
        { unitPrice: '2000', quantity: 1, taxRate: 0.08 },
        { unitPrice: '3000', quantity: 3, taxRate: 0.1 },
        { unitPrice: '500', quantity: 1, taxRate: 0 },
        { unitPrice: '1500', quantity: 2, taxRate: 0.08 }
      ]
      const result = calculateTaxByRate(items)
      
      expect(result.byRate).toEqual([
        { rate: 0.1, taxableAmount: 11000, taxAmount: 1100 },
        { rate: 0.08, taxableAmount: 5000, taxAmount: 400 },
        { rate: 0, taxableAmount: 500, taxAmount: 0 }
      ])
      expect(result.totalTaxAmount).toBe(1500)
    })
  })

  describe('tax rate conversion', () => {
    it('should convert percentage to decimal', () => {
      expect(convertTaxRateToDecimal(10)).toBe(0.1)
      expect(convertTaxRateToDecimal(8)).toBe(0.08)
      expect(convertTaxRateToDecimal(0)).toBe(0)
    })

    it('should convert decimal to percentage', () => {
      expect(convertTaxRateToPercent(0.1)).toBe(10)
      expect(convertTaxRateToPercent(0.08)).toBe(8)
      expect(convertTaxRateToPercent(0)).toBe(0)
    })

    it('should handle invalid values', () => {
      expect(() => convertTaxRateToDecimal(-10)).toThrow()
      expect(() => convertTaxRateToDecimal(101)).toThrow()
      expect(() => convertTaxRateToPercent(-0.1)).toThrow()
      expect(() => convertTaxRateToPercent(1.1)).toThrow()
    })
  })
}) 