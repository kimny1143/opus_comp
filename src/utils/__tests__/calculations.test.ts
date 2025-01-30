import { calculateSubtotal, calculateTaxAmount, calculateTotal, calculateOrderAmounts } from '../calculations'
import { OrderItem } from '@/components/forms/schemas/orderSchema'

describe('calculations', () => {
  const sampleItems: OrderItem[] = [
    {
      itemName: '商品A',
      quantity: 2,
      unitPrice: 1000,
      taxRate: 0.1,
      description: ''
    },
    {
      itemName: '商品B',
      quantity: 1,
      unitPrice: 500,
      taxRate: 0.1,
      description: ''
    }
  ]

  describe('calculateSubtotal', () => {
    it('正しく小計を計算できること', () => {
      // 2 * 1000 + 1 * 500 = 2500
      expect(calculateSubtotal(sampleItems)).toBe(2500)
    })

    it('空の配列の場合は0を返すこと', () => {
      expect(calculateSubtotal([])).toBe(0)
    })
  })

  describe('calculateTaxAmount', () => {
    it('正しく税額を計算できること', () => {
      // (2 * 1000 * 0.1) + (1 * 500 * 0.1) = 250
      expect(calculateTaxAmount(sampleItems)).toBe(250)
    })

    it('空の配列の場合は0を返すこと', () => {
      expect(calculateTaxAmount([])).toBe(0)
    })

    it('税率が0の場合は0を返すこと', () => {
      const itemsWithZeroTax = sampleItems.map(item => ({ ...item, taxRate: 0 }))
      expect(calculateTaxAmount(itemsWithZeroTax)).toBe(0)
    })
  })

  describe('calculateTotal', () => {
    it('正しく合計金額を計算できること', () => {
      // 小計2500 + 税額250 = 2750
      expect(calculateTotal(sampleItems)).toBe(2750)
    })

    it('空の配列の場合は0を返すこと', () => {
      expect(calculateTotal([])).toBe(0)
    })
  })

  describe('calculateOrderAmounts', () => {
    it('正しく全ての金額を計算できること', () => {
      const result = calculateOrderAmounts(sampleItems)
      expect(result).toEqual({
        subtotal: 2500,
        taxAmount: 250,
        total: 2750
      })
    })

    it('空の配列の場合は全て0を返すこと', () => {
      const result = calculateOrderAmounts([])
      expect(result).toEqual({
        subtotal: 0,
        taxAmount: 0,
        total: 0
      })
    })
  })
}) 