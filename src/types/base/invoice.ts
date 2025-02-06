import { BankInfo, StatusHistory, Tag, TaxCalculation } from './common'

/**
 * 請求書ステータス
 */
export enum InvoiceStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  REVIEWING = "REVIEWING",
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
  OVERDUE = "OVERDUE",
  SENT = "SENT"
}

/**
 * 請求書の基本アイテム
 */
export interface BaseInvoiceItem {
  id: string
  itemName: string
  description?: string | null
  quantity: number
  unitPrice: number
  taxRate: number
  amount?: number
}

/**
 * 請求書テンプレートの基本型
 */
export interface BaseInvoiceTemplate {
  id: string
  name: string
  description?: string
  bankInfo: BankInfo
  notes: string
  paymentTerms: string
  defaultItems?: BaseInvoiceItem[]
}

/**
 * 請求書発行者の基本情報
 */
export interface BaseIssuer {
  id: string
  name: string
  registrationNumber: string
  address: string
  contactInfo: {
    email: string
    phone: string
  }
}

/**
 * 請求書の基本型
 */
export interface BaseInvoice {
  id: string
  invoiceNumber: string
  issueDate: Date
  dueDate: Date
  status: InvoiceStatus
  items: BaseInvoiceItem[]
  totalAmount: number
  taxAmount: number
  notes: string
  tags: Tag[]
  statusHistory: StatusHistory[]
  bankInfo: BankInfo
  template?: BaseInvoiceTemplate
  issuer: BaseIssuer
}

/**
 * 請求書の税計算サマリー
 */
export interface InvoiceTaxSummary {
  byRate: {
    [rate: string]: TaxCalculation
  }
  total: {
    taxableAmount: number
    taxAmount: number
  }
}

/**
 * 請求書フォームデータの基本型
 */
export interface BaseInvoiceFormData {
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  items: BaseInvoiceItem[]
  bankInfo: BankInfo
  notes: string
  tags: Tag[]
  template?: BaseInvoiceTemplate
}

/**
 * 請求書検索パラメータ
 */
export interface InvoiceSearchParams {
  status?: InvoiceStatus[]
  dateRange?: {
    start: Date
    end: Date
  }
  keyword?: string
  tags?: string[]
  issuerId?: string
  minAmount?: number
  maxAmount?: number
}