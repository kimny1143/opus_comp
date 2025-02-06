/**
 * 基本的な型定義
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

/**
 * 口座種別
 */
export enum AccountType {
  ORDINARY = "ORDINARY",
  CURRENT = "CURRENT",
  SAVINGS = "SAVINGS"
}

/**
 * 銀行口座情報
 */
export interface BankInfo {
  bankName: string
  branchName: string
  accountType: AccountType
  accountNumber: string
  accountHolder: string
}

/**
 * ステータス関連の基本型
 */
export interface StatusHistory {
  id: string
  status: string
  createdAt: Date
  updatedAt: Date
  comment?: string
  userId: string
}

/**
 * タグ関連の基本型
 */
export interface Tag {
  id: string
  name: string
}

/**
 * 住所関連の基本型
 */
export interface Address {
  postalCode: string
  prefecture: string
  city: string
  street: string
  building?: string
}

/**
 * 金額関連の基本型
 */
export interface MonetaryAmount {
  amount: number
  currency: string
}

/**
 * 税率計算関連の基本型
 */
export interface TaxCalculation {
  taxRate: number
  taxableAmount: number
  taxAmount: number
}

/**
 * 日付範囲の基本型
 */
export interface DateRange {
  startDate: Date
  endDate: Date
}

/**
 * ページネーション用の基本型
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 検索条件の基本型
 */
export interface SearchParams {
  keyword?: string
  filters?: Record<string, unknown>
  dateRange?: DateRange
}

/**
 * レスポンスメタデータの基本型
 */
export interface ResponseMetadata {
  total: number
  page: number
  limit: number
  hasMore: boolean
}