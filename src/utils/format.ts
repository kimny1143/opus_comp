/**
 * 金額を通貨形式にフォーマット
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount);
}

/**
 * 日付を日本語形式にフォーマット
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * 税率を表示用にフォーマット
 */
export function formatTaxRate(rate: number): string {
  return `${rate}%`;
}

/**
 * 数値を3桁区切りでフォーマット
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ja-JP').format(num);
} 