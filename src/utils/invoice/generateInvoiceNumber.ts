/**
 * 請求書番号を生成する
 * フォーマット: INV-YYYYMMDD-XXX (XXXは3桁の連番)
 * @returns 生成された請求書番号
 */
export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

  return `INV-${year}${month}${day}-${random}`
}