/**
 * 請求書の基本情報を定義するインターフェース
 * MVPの要件に合わせて最小限の項目のみを含む
 */
export interface Invoice {
  id: string
  vendorId: string
  status: 'DRAFT' | 'APPROVED'
  totalAmount: number
  createdAt: Date
  updatedAt: Date
  vendor: {
    name: string
    email: string
  }
}

/**
 * 請求書作成時のデータ型
 */
export type CreateInvoiceInput = {
  vendorId: string
  amount: number
}

/**
 * 請求書更新時のデータ型
 */
export type UpdateInvoiceInput = {
  amount?: number
  status?: 'DRAFT' | 'APPROVED'
}

/**
 * 請求書の検索パラメータ
 * MVPではシンプルな検索のみをサポート
 */
export interface InvoiceSearchParams {
  vendorId?: string
  status?: 'DRAFT' | 'APPROVED'
}

/**
 * APIレスポンスの型
 */
export interface InvoiceResponse {
  invoice: Invoice
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  total: number
}
