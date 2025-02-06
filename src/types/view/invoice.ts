import type { BankInfo, Tag } from '../base/common'
import type { BaseInvoiceItem, InvoiceStatus, InvoiceTaxSummary } from '../base/invoice'

/**
 * ビュー層の請求書アイテム
 */
export interface ViewInvoiceItem extends BaseInvoiceItem {
  id: string
  invoiceId: string
  description: string | null
  taxAmount: string
  taxableAmount: string
}

/**
 * ビュー層の請求書テンプレート
 */
export interface ViewInvoiceTemplate {
  id: string
  name: string
  description: string | undefined
  bankInfo: BankInfo
  notes: string
  paymentTerms: string
  defaultItems?: ViewInvoiceItem[]
  registrationNumber: string
  contractorName: string
  contractorAddress: string
}

/**
 * ビュー層の請求書
 */
export interface ViewInvoice {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  notes: string
  bankInfo: BankInfo
  template?: ViewInvoiceTemplate
  items: ViewInvoiceItem[]
  vendor: {
    id: string
    name: string
    registrationNumber: string
  }
  totalAmount: string
  taxAmount: string
  taxSummary: InvoiceTaxSummary
  tags: Tag[]
  statusHistory: {
    id: string
    status: InvoiceStatus
    createdAt: string
    comment?: string
    user: {
      id: string
      name: string
    }
  }[]
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
  }
  updatedBy: {
    id: string
    name: string
  }
}

/**
 * ビュー層の請求書フォームデータ
 */
export interface ViewInvoiceForm {
  status: InvoiceStatus
  registrationNumber: string
  vendorId: string
  issueDate: Date
  dueDate: Date
  items: ViewInvoiceItem[]
  bankInfo: BankInfo
  notes: string
  tags: Tag[]
  purchaseOrderId?: string
}

/**
 * ビュー層の請求書一覧アイテム
 */
export interface ViewInvoiceListItem {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  vendor: {
    id: string
    name: string
  }
  totalAmount: string
  tags: Tag[]
  isOverdue: boolean
}

/**
 * ビュー層の請求書フィルター
 */
export interface ViewInvoiceFilters {
  status: InvoiceStatus[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  vendorId?: string
  tags: string[]
  searchText: string
}

/**
 * ビュー層の請求書ソート
 */
export interface ViewInvoiceSort {
  field: 'issueDate' | 'dueDate' | 'totalAmount' | 'status'
  direction: 'asc' | 'desc'
}

/**
 * ビュー層の請求書ページネーション
 */
export interface ViewInvoicePagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}