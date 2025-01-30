import type { InvoiceStatus, VendorStatus } from './enums'

export type { VendorStatus, InvoiceStatus }

// 一括操作の入力型
export interface BulkActionBase {
  action: 'delete' | 'updateStatus'
}

export interface BulkDeleteAction extends BulkActionBase {
  action: 'delete'
  ids: string[]
}

export interface BulkStatusUpdateAction<T> extends BulkActionBase {
  action: 'updateStatus'
  ids: string[]
  status: T
}

// レスポンス型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
  }
}

export interface BulkActionResult {
  id: string
  success: boolean
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export type ApiErrorResponse = ApiResponse<never>

// 共通の一括操作型
export interface BulkOperationParams {
  BULK_OPERATION_LIMIT: number
}

export const BULK_OPERATION_PARAMS: BulkOperationParams = {
  BULK_OPERATION_LIMIT: 100
} 