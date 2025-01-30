import { useMemo } from 'react'
import { TaxCalculation, InvoiceTaxSummary, TaxableItem } from './types'

/**
 * 商品1つあたりの税額を計算する
 */
export const calculateItemTax = (item: TaxableItem): TaxCalculation => {
  const taxableAmount = Math.floor(item.unitPrice.toNumber() * item.quantity)
  const taxAmount = Math.floor(taxableAmount * item.taxRate)
  return {
    taxRate: item.taxRate,
    taxableAmount,
    taxAmount
  }
}

/**
 * 商品の税抜小計を計算する
 */
export const calculateSubtotal = (items: TaxableItem[]): number => {
  return items.reduce((acc, item) => {
    if (item.quantity === 0) return acc
    const itemSubtotal = Math.floor(item.unitPrice.toNumber() * item.quantity)
    return acc + itemSubtotal
  }, 0)
}

/**
 * 商品の合計税額を計算する
 */
export const calculateTotalTax = (items: TaxableItem[]): number => {
  return items.reduce((acc, item) => {
    if (item.quantity === 0) return acc
    const { taxAmount } = calculateItemTax(item)
    return acc + taxAmount
  }, 0)
}

/**
 * 商品の税込合計金額を計算する
 */
export const calculateTotal = (items: TaxableItem[]): number => {
  return calculateSubtotal(items) + calculateTotalTax(items)
}

/**
 * 税率ごとの集計を計算する
 */
export const calculateTaxSummary = (items: TaxableItem[]): InvoiceTaxSummary => {
  const taxRates = new Set(items.map(item => item.taxRate))
  const byRate = Array.from(taxRates).map(rate => {
    const itemsWithRate = items.filter(item => item.taxRate === rate)
    const taxableAmount = itemsWithRate.reduce((acc, item) => {
      if (item.quantity === 0) return acc
      return acc + Math.floor(item.unitPrice.toNumber() * item.quantity)
    }, 0)
    const taxAmount = Math.floor(taxableAmount * rate)
    return {
      taxRate: rate,
      taxableAmount,
      taxAmount
    }
  }).sort((a, b) => b.taxRate - a.taxRate) // 税率の高い順にソート

  const totalTaxableAmount = byRate.reduce((acc, rate) => acc + rate.taxableAmount, 0)
  const totalTaxAmount = byRate.reduce((acc, rate) => acc + rate.taxAmount, 0)

  return {
    byRate,
    totalTaxableAmount,
    totalTaxAmount
  }
}

// メモ化されたフック
export const useTaxCalculation = (items: TaxableItem[]) => {
  return useMemo(() => calculateTaxSummary(items), [items])
}

/**
 * 税率の検証
 * @param rate 小数形式の税率（例：0.08, 0.1）
 */
export const validateTaxRate = (rate: number): boolean => {
  const validRates = [0, 0.08, 0.1] // 0%, 8%, 10%
  return validRates.includes(rate)
}

export const convertTaxRateToDecimal = (percentage: number): number => {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Tax rate must be between 0 and 100')
  }
  return percentage / 100
}

export const convertTaxRateToPercent = (decimal: number): number => {
  if (decimal < 0 || decimal > 1) {
    throw new Error('Tax rate must be between 0 and 1')
  }
  return decimal * 100
} 