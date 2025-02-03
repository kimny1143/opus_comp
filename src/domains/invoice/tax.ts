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
  if (item.quantity <= 0) {
    return {
      taxRate: item.taxRate,
      taxableAmount: 0,
      taxAmount: 0
    }
  }
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
    if (item.quantity <= 0) return acc
    const itemSubtotal = Math.floor(item.unitPrice.toNumber() * item.quantity)
    return acc + itemSubtotal
  }, 0)
}

/**
 * 商品の合計税額を計算する
 */
export const calculateTotalTax = (items: TaxableItem[]): number => {
  return items.reduce((acc, item) => {
    if (item.quantity <= 0) return acc
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
  // 数量が0以下のアイテムを除外
  const validItems = items.filter(item => item.quantity > 0)
  
  // 税率の重複を除去し、高い順にソート
  const taxRates = Array.from(new Set(validItems.map(item => item.taxRate)))
    .sort((a, b) => b - a)

  const byRate = taxRates.map(rate => {
    const taxableItems = validItems.filter(item => item.taxRate === rate)
    const taxableAmount = taxableItems.reduce((sum, item) => {
      return sum.plus(item.unitPrice.mul(new Prisma.Decimal(item.quantity)))
    }, new Prisma.Decimal(0))
    
    const taxAmount = taxableAmount.mul(new Prisma.Decimal(rate))

    return {
      taxRate: rate,
      taxableAmount: Math.floor(taxableAmount.toNumber()),
      taxAmount: Math.floor(taxAmount.toNumber())
    }
  }).filter(summary => summary.taxableAmount > 0) // 課税対象額が0の税率は除外

  const totalTaxableAmount = validItems.reduce((sum, item) => {
    return sum.plus(item.unitPrice.mul(new Prisma.Decimal(item.quantity)))
  }, new Prisma.Decimal(0))

  const totalTaxAmount = byRate.reduce((sum, { taxAmount }) => sum + taxAmount, 0)

  return {
    byRate,
    totalTaxableAmount: Math.floor(totalTaxableAmount.toNumber()),
    totalTaxAmount
  }
}

// メモ化されたフック
export const useTaxCalculation = (items: TaxableItem[]) => {
  return useMemo(() => calculateTaxSummary(items), [items])
}

/**
 * 税率の検証
 * @param rate 小数形式の税率(例:0.08, 0.1)
 */
export const validateTaxRate = (rate: number): boolean => {
  const validRates = [0.08, 0.1] // 8%, 10%
  return validRates.includes(rate)
}

/**
 * パーセント表記から小数形式に変換
 * @param percentage パーセント表記の税率(例:8, 10)
 * @returns 小数形式の税率(例:0.08, 0.1)
 */
export const convertTaxRateToDecimal = (percentage: number): number => {
  if (percentage !== 8 && percentage !== 10) {
    throw new Error('Tax rate must be either 8% or 10%')
  }
  return percentage / 100
}

/**
 * 小数形式からパーセント表記に変換
 * @param decimal 小数形式の税率(例:0.08, 0.1)
 * @returns パーセント表記の税率(例:8, 10)
 */
export const convertTaxRateToPercent = (decimal: number): number => {
  if (!validateTaxRate(decimal)) {
    throw new Error('Tax rate must be either 0.08 or 0.1')
  }
  return decimal * 100
}