import { useMemo } from 'react'
import { TaxCalculation, InvoiceTaxSummary } from './types'
import { Prisma } from '@prisma/client'

export interface TaxableItem {
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: number;
}

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
export function calculateTaxSummary(items: TaxableItem[]): InvoiceTaxSummary {
  const taxRates = new Set(items.map(item => item.taxRate))
  const byRate = Array.from(taxRates).map(rate => {
    const taxableItems = items.filter(item => item.taxRate === rate)
    const taxableAmount = taxableItems.reduce((sum, item) => {
      return sum.plus(item.unitPrice.mul(item.quantity))
    }, new Prisma.Decimal(0))
    const taxAmount = taxableAmount.mul(rate / 100)

    return {
      taxRate: rate,
      taxableAmount: taxableAmount.toNumber(),
      taxAmount: taxAmount.toNumber()
    }
  })

  const totalTaxableAmount = items.reduce((sum, item) => {
    return sum.plus(item.unitPrice.mul(item.quantity))
  }, new Prisma.Decimal(0))

  const totalTaxAmount = byRate.reduce((sum, { taxAmount }) => sum + taxAmount, 0)

  return {
    byRate,
    totalTaxableAmount: totalTaxableAmount.toNumber(),
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