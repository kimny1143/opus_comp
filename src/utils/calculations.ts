import { OrderItem } from '@/components/forms/schemas/orderSchema'

/**
 * 小計を計算
 */
export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.quantity * item.unitPrice)
  }, 0)
}

/**
 * 税額を計算
 */
export function calculateTaxAmount(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    const itemAmount = item.quantity * item.unitPrice
    return total + (itemAmount * item.taxRate)
  }, 0)
}

/**
 * 合計金額を計算
 */
export function calculateTotal(items: OrderItem[]): number {
  const subtotal = calculateSubtotal(items)
  const taxAmount = calculateTaxAmount(items)
  return subtotal + taxAmount
}

/**
 * 請求書/発注書の金額計算をまとめて実行
 */
export function calculateOrderAmounts(items: OrderItem[]) {
  const subtotal = calculateSubtotal(items)
  const taxAmount = calculateTaxAmount(items)
  const total = subtotal + taxAmount

  return {
    subtotal,
    taxAmount,
    total
  }
} 