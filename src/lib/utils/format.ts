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
 * 金額を日本円形式でフォーマットする
 * @param amount 金額（数値またはDecimal）
 * @returns フォーマットされた金額文字列（例：¥1,000）
 */
export function formatCurrency(amount: number | { toString: () => string }): string {
  const value = typeof amount === 'number' ? amount : parseFloat(amount.toString())
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(value)
}

/**
 * 数値を3桁区切りでフォーマットする
 * @param num 数値
 * @returns フォーマットされた数値文字列（例：1,000）
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ja-JP').format(num)
} 