import { Prisma } from '@prisma/client'

/**
 * 日付を日本語形式でフォーマットする
 * @param date 日付（DateまたはDate文字列）
 * @returns フォーマットされた日付文字列（例：2024年1月1日）
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 金額を日本円形式でフォーマットします
 * @param amount 金額（number, string, または Prisma.Decimal）
 * @returns フォーマットされた金額文字列（例: ¥1,234,567）
 */
export function formatCurrency(amount: number | string | Prisma.Decimal): string {
  const value = typeof amount === 'object' ? amount.toString() : String(amount)
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(Number(value))
}

/**
 * 数値を3桁区切りでフォーマットします
 * @param value 数値（number, string, または Prisma.Decimal）
 * @returns フォーマットされた数値文字列（例: 1,234）
 */
export function formatNumber(value: number | string | Prisma.Decimal): string {
  const numValue = typeof value === 'object' ? value.toString() : String(value)
  return new Intl.NumberFormat('ja-JP').format(Number(numValue))
}

/**
 * 税率を表示用にフォーマットします
 * @param rate 税率（number, string, または Prisma.Decimal）
 * @returns フォーマットされた税率文字列（例: 10%）
 */
export function formatTaxRate(rate: number | string | Prisma.Decimal): string {
  const value = typeof rate === 'object' ? rate.toString() : String(rate)
  return `${Number(value)}%`
} 