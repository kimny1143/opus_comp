import { describe, it, expect } from 'vitest'
import { calculateItemTax, calculateTotal, calculateSubtotal, calculateTotalTax, calculateTaxSummary, convertTaxRateToDecimal, convertTaxRateToPercent } from '../tax'
import { createDecimalMock } from '@/test/helpers/mockDecimal'
import { TaxableItem } from '../types'

describe('税金計算', () => {
  describe('明細行の税金計算', () => {
    it('基本的な税金計算が正しく行われる', () => {
      const item: TaxableItem = {
        unitPrice: createDecimalMock(1000),
        quantity: 2,
        taxRate: 0.1
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(2000)
      expect(result.taxAmount).toBe(200)
    })

    it('税率が0%の場合、税額が0になる', () => {
      const item: TaxableItem = {
        unitPrice: createDecimalMock(1000),
        quantity: 2,
        taxRate: 0
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(2000)
      expect(result.taxAmount).toBe(0)
    })

    it('小数点以下の端数が正しく切り捨てられる', () => {
      const item: TaxableItem = {
        unitPrice: createDecimalMock(101),
        quantity: 3,
        taxRate: 0.1
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(303)
      expect(result.taxAmount).toBe(30)
    })

    it('大きな数値でも正しく計算される', () => {
      const item: TaxableItem = {
        unitPrice: createDecimalMock(999999),
        quantity: 999,
        taxRate: 0.1
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(999999 * 999)
      expect(result.taxAmount).toBe(Math.floor(999999 * 999 * 0.1))
    })

    it('税率が8%の場合も正しく計算される', () => {
      const item: TaxableItem = {
        unitPrice: createDecimalMock(1000),
        quantity: 2,
        taxRate: 0.08
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(2000)
      expect(result.taxAmount).toBe(160)
    })

    it('税率が10%の場合も正しく計算される', () => {
      const item: TaxableItem = {
        unitPrice: createDecimalMock(1000),
        quantity: 2,
        taxRate: 0.1
      }
      const result = calculateItemTax(item)
      expect(result.taxableAmount).toBe(2000)
      expect(result.taxAmount).toBe(200)
    })
  })

  describe('税率別の集計', () => {
    it('複数の税率が混在する場合、税率ごとに正しく集計される', () => {
      const items: TaxableItem[] = [
        { unitPrice: createDecimalMock(1000), quantity: 1, taxRate: 0.1 },
        { unitPrice: createDecimalMock(2000), quantity: 1, taxRate: 0.08 },
        { unitPrice: createDecimalMock(3000), quantity: 1, taxRate: 0 }
      ]
      const result = calculateTaxSummary(items)
      expect(result.byRate).toEqual([
        { taxRate: 0.1, taxableAmount: 1000, taxAmount: 100 },
        { taxRate: 0.08, taxableAmount: 2000, taxAmount: 160 },
        { taxRate: 0, taxableAmount: 3000, taxAmount: 0 }
      ])
      expect(result.totalTaxableAmount).toBe(6000)
      expect(result.totalTaxAmount).toBe(260)
    })

    it('明細行が空の場合、0として扱われる', () => {
      const result = calculateTaxSummary([])
      expect(result.byRate).toEqual([])
      expect(result.totalTaxAmount).toBe(0)
      expect(result.totalTaxableAmount).toBe(0)
    })

    it('同じ税率の明細行は集約される', () => {
      const items: TaxableItem[] = [
        { unitPrice: createDecimalMock(1000), quantity: 1, taxRate: 0.1 },
        { unitPrice: createDecimalMock(2000), quantity: 1, taxRate: 0.1 }
      ]
      const result = calculateTaxSummary(items)
      expect(result.byRate).toEqual([
        { taxRate: 0.1, taxableAmount: 3000, taxAmount: 300 }
      ])
      expect(result.totalTaxAmount).toBe(300)
      expect(result.totalTaxableAmount).toBe(3000)
    })

    it('複数の税率と数量が混在する場合も正しく計算される', () => {
      const items: TaxableItem[] = [
        { unitPrice: createDecimalMock(5000), quantity: 2, taxRate: 0.1 },
        { unitPrice: createDecimalMock(5000), quantity: 1, taxRate: 0.08 },
        { unitPrice: createDecimalMock(500), quantity: 1, taxRate: 0 }
      ]
      const result = calculateTaxSummary(items)
      expect(result.byRate).toEqual([
        { taxRate: 0.1, taxableAmount: 10000, taxAmount: 1000 },
        { taxRate: 0.08, taxableAmount: 5000, taxAmount: 400 },
        { taxRate: 0, taxableAmount: 500, taxAmount: 0 }
      ])
      expect(result.totalTaxableAmount).toBe(15500)
      expect(result.totalTaxAmount).toBe(1400)
    })
  })

  describe('税率の変換', () => {
    it('パーセント表記から小数表記への変換が正しく行われる', () => {
      expect(convertTaxRateToDecimal(10)).toBe(0.1)
      expect(convertTaxRateToDecimal(8)).toBe(0.08)
      expect(convertTaxRateToDecimal(0)).toBe(0)
    })

    it('小数表記からパーセント表記への変換が正しく行われる', () => {
      expect(convertTaxRateToPercent(0.1)).toBe(10)
      expect(convertTaxRateToPercent(0.08)).toBe(8)
      expect(convertTaxRateToPercent(0)).toBe(0)
    })

    it('無効な値はエラーになる', () => {
      expect(() => convertTaxRateToDecimal(-10)).toThrow()
      expect(() => convertTaxRateToDecimal(101)).toThrow()
      expect(() => convertTaxRateToPercent(-0.1)).toThrow()
      expect(() => convertTaxRateToPercent(1.1)).toThrow()
    })
  })

  describe('請求書の税額計算', () => {
    describe('単一商品の計算', () => {
      it('基本的な税額計算（10%）', () => {
        const item: TaxableItem = {
          quantity: 1,
          unitPrice: createDecimalMock(1000),
          taxRate: 0.1
        }
        const result = calculateItemTax(item)
        expect(result.taxAmount).toBe(100)
        expect(result.taxableAmount).toBe(1000)
        expect(result.taxRate).toBe(0.1)
      })

      it('数量が2以上の場合の税額計算', () => {
        const item: TaxableItem = {
          quantity: 2,
          unitPrice: createDecimalMock(1000),
          taxRate: 0.1
        }
        const result = calculateItemTax(item)
        expect(result.taxAmount).toBe(200)
        expect(result.taxableAmount).toBe(2000)
        expect(result.taxRate).toBe(0.1)
      })

      it('端数が発生する場合の税額計算（切り捨て）', () => {
        const item: TaxableItem = {
          quantity: 3,
          unitPrice: createDecimalMock(1000),
          taxRate: 0.08
        }
        const result = calculateItemTax(item)
        // 3000 * 0.08 = 240
        expect(result.taxAmount).toBe(240)
        expect(result.taxableAmount).toBe(3000)
        expect(result.taxRate).toBe(0.08)
      })
    })

    describe('複数商品の計算', () => {
      it('同一税率の複数商品の合計金額計算', () => {
        const items: TaxableItem[] = [
          {
            quantity: 2,
            unitPrice: createDecimalMock(1000),
            taxRate: 0.1
          },
          {
            quantity: 1,
            unitPrice: createDecimalMock(2000),
            taxRate: 0.1
          }
        ]
        const subtotal = calculateSubtotal(items)
        const totalTax = calculateTotalTax(items)
        const total = calculateTotal(items)
        // 小計: 1000 * 2 + 2000 = 4000
        // 税額: 4000 * 0.1 = 400
        // 合計: 4000 + 400 = 4400
        expect(subtotal).toBe(4000)
        expect(totalTax).toBe(400)
        expect(total).toBe(4400)
      })

      it('異なる税率の商品が混在する場合の計算', () => {
        const items: TaxableItem[] = [
          {
            quantity: 1,
            unitPrice: createDecimalMock(1000),
            taxRate: 0.1
          },
          {
            quantity: 1,
            unitPrice: createDecimalMock(2000),
            taxRate: 0.08
          }
        ]
        const subtotal = calculateSubtotal(items)
        const totalTax = calculateTotalTax(items)
        const total = calculateTotal(items)
        // 小計: 1000 + 2000 = 3000
        // 税額: (1000 * 0.1) + (2000 * 0.08) = 100 + 160 = 260
        // 合計: 3000 + 260 = 3260
        expect(subtotal).toBe(3000)
        expect(totalTax).toBe(260)
        expect(total).toBe(3260)
      })
    })

    describe('エッジケース', () => {
      it('商品が空の場合は0を返す', () => {
        const items: TaxableItem[] = []
        const subtotal = calculateSubtotal(items)
        const totalTax = calculateTotalTax(items)
        const total = calculateTotal(items)
        expect(subtotal).toBe(0)
        expect(totalTax).toBe(0)
        expect(total).toBe(0)
      })

      it('数量0の商品は計算に含まれない', () => {
        const items: TaxableItem[] = [
          {
            quantity: 2,
            unitPrice: createDecimalMock(1000),
            taxRate: 0.1
          },
          {
            quantity: 0,
            unitPrice: createDecimalMock(2000),
            taxRate: 0.1
          }
        ]
        const subtotal = calculateSubtotal(items)
        const totalTax = calculateTotalTax(items)
        const total = calculateTotal(items)
        // 小計: 1000 * 2 = 2000
        // 税額: 2000 * 0.1 = 200
        // 合計: 2000 + 200 = 2200
        expect(subtotal).toBe(2000)
        expect(totalTax).toBe(200)
        expect(total).toBe(2200)
      })

      it('小数点以下の端数処理（切り捨て）', () => {
        const item: TaxableItem = {
          quantity: 3,
          unitPrice: createDecimalMock(1001),
          taxRate: 0.08
        }
        const result = calculateItemTax(item)
        // 3003 * 0.08 = 240.24 → 240（端数切り捨て）
        expect(result.taxAmount).toBe(240)
        expect(result.taxableAmount).toBe(3003)
        expect(result.taxRate).toBe(0.08)
      })

      it('大きな数値の計算', () => {
        const item: TaxableItem = {
          quantity: 999,
          unitPrice: createDecimalMock(999999),
          taxRate: 0.1
        }
        const result = calculateItemTax(item)
        // 999 * 999999 = 998999001
        // 998999001 * 0.1 = 99899900.1 → 99899900（端数切り捨て）
        expect(result.taxAmount).toBe(99899900)
        expect(result.taxableAmount).toBe(998999001)
        expect(result.taxRate).toBe(0.1)
      })
    })

    describe('税率ごとの集計', () => {
      it('同一税率の商品の集計', () => {
        const items: TaxableItem[] = [
          {
            quantity: 2,
            unitPrice: createDecimalMock(1000),
            taxRate: 0.1
          },
          {
            quantity: 1,
            unitPrice: createDecimalMock(2000),
            taxRate: 0.1
          }
        ]
        const summary = calculateTaxSummary(items)
        expect(summary.byRate).toHaveLength(1)
        expect(summary.byRate[0]).toEqual({
          taxRate: 0.1,
          taxableAmount: 4000,
          taxAmount: 400
        })
        expect(summary.totalTaxableAmount).toBe(4000)
        expect(summary.totalTaxAmount).toBe(400)
      })

      it('異なる税率の商品の集計', () => {
        const items: TaxableItem[] = [
          {
            quantity: 1,
            unitPrice: createDecimalMock(1000),
            taxRate: 0.1
          },
          {
            quantity: 1,
            unitPrice: createDecimalMock(2000),
            taxRate: 0.08
          }
        ]
        const summary = calculateTaxSummary(items)
        expect(summary.byRate).toHaveLength(2)
        // 税率の高い順にソートされていることを確認
        expect(summary.byRate[0]).toEqual({
          taxRate: 0.1,
          taxableAmount: 1000,
          taxAmount: 100
        })
        expect(summary.byRate[1]).toEqual({
          taxRate: 0.08,
          taxableAmount: 2000,
          taxAmount: 160
        })
        expect(summary.totalTaxableAmount).toBe(3000)
        expect(summary.totalTaxAmount).toBe(260)
      })

      it('数量0の商品は集計に含まれない', () => {
        const items: TaxableItem[] = [
          {
            quantity: 2,
            unitPrice: createDecimalMock(1000),
            taxRate: 0.1
          },
          {
            quantity: 0,
            unitPrice: createDecimalMock(2000),
            taxRate: 0.1
          }
        ]
        const summary = calculateTaxSummary(items)
        expect(summary.byRate).toHaveLength(1)
        expect(summary.byRate[0]).toEqual({
          taxRate: 0.1,
          taxableAmount: 2000,
          taxAmount: 200
        })
        expect(summary.totalTaxableAmount).toBe(2000)
        expect(summary.totalTaxAmount).toBe(200)
      })

      it('商品が空の場合は空の集計を返す', () => {
        const items: TaxableItem[] = []
        const summary = calculateTaxSummary(items)
        expect(summary.byRate).toHaveLength(0)
        expect(summary.totalTaxableAmount).toBe(0)
        expect(summary.totalTaxAmount).toBe(0)
      })

      it('小数点以下の端数処理（切り捨て）', () => {
        const items: TaxableItem[] = [
          {
            quantity: 3,
            unitPrice: createDecimalMock(1001),
            taxRate: 0.08
          },
          {
            quantity: 2,
            unitPrice: createDecimalMock(1002),
            taxRate: 0.1
          }
        ]
        const summary = calculateTaxSummary(items)
        expect(summary.byRate).toHaveLength(2)
        // 税率の高い順にソートされていることを確認
        expect(summary.byRate[0]).toEqual({
          taxRate: 0.1,
          taxableAmount: 2004,
          taxAmount: 200  // 2004 * 0.1 = 200.4 → 200（切り捨て）
        })
        expect(summary.byRate[1]).toEqual({
          taxRate: 0.08,
          taxableAmount: 3003,
          taxAmount: 240  // 3003 * 0.08 = 240.24 → 240（切り捨て）
        })
        expect(summary.totalTaxableAmount).toBe(5007)
        expect(summary.totalTaxAmount).toBe(440)
      })
    })
  })
}) 