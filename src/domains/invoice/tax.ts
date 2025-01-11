import { useMemo } from 'react'
import { TaxCalculation, InvoiceTaxSummary } from './types'

export interface TaxableItem {
  unitPrice: string
  quantity: number
  taxRate: number
}

export const calculateItemTax = (item: TaxableItem) => {
  const taxableAmount = Math.floor(Number(item.unitPrice)) * item.quantity
  const taxAmount = Math.floor(taxableAmount * item.taxRate)
  return { taxableAmount, taxAmount }
}

export const calculateTaxByRate = (items: TaxableItem[]): InvoiceTaxSummary => {
  // 税率ごとにグループ化
  const groupedByRate = items.reduce<Record<string, TaxableItem[]>>((acc, item) => {
    const rate = item.taxRate.toString()
    if (!acc[rate]) {
      acc[rate] = []
    }
    acc[rate].push(item)
    return acc
  }, {})

  // 税率ごとの集計
  const byRate = Object.entries(groupedByRate).map(([rate, items]): TaxCalculation => {
    const rateNumber = Number(rate)
    const { taxableAmount, taxAmount } = items.reduce(
      (acc, item) => {
        const result = calculateItemTax(item)
        return {
          taxableAmount: acc.taxableAmount + result.taxableAmount,
          taxAmount: acc.taxAmount + result.taxAmount
        }
      },
      { taxableAmount: 0, taxAmount: 0 }
    )
    return { taxRate: rateNumber, taxableAmount, taxAmount }
  })

  // 合計の計算
  const totalTaxAmount = byRate.reduce((sum, { taxAmount }) => sum + taxAmount, 0)
  const totalTaxableAmount = byRate.reduce((sum, { taxableAmount }) => sum + taxableAmount, 0)

  return { byRate, totalTaxAmount, totalTaxableAmount }
}

// メモ化されたフック
export const useTaxCalculation = (items: TaxableItem[]) => {
  return useMemo(() => calculateTaxByRate(items), [items])
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