/**
 * 口座種別の定義
 */
export type AccountType = 'ORDINARY' | 'CURRENT' | 'SAVINGS'

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'ORDINARY' as AccountType, label: '普通' },
  { value: 'CURRENT' as AccountType, label: '当座' },
  { value: 'SAVINGS' as AccountType, label: '貯蓄' }
] as const

/**
 * 請求書ステータスのオプション
 */
export const INVOICE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '下書き' },
  { value: 'PENDING', label: '承認待ち' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'PAID', label: '支払済み' },
  { value: 'REJECTED', label: '却下' },
  { value: 'REVIEWING', label: '確認中' },
  { value: 'OVERDUE', label: '支払期限超過' }
] as const

/**
 * 発注書ステータスのオプション
 */
export const PURCHASE_ORDER_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '下書き' },
  { value: 'PENDING', label: '承認待ち' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'DELIVERED', label: '納品済み' },
  { value: 'CANCELLED', label: 'キャンセル' }
] as const

/**
 * 選択オプションの型定義
 */
export type SelectOption<T> = {
  value: T
  label: string
} 