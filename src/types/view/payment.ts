import { BaseUpcomingPayment } from '../base/payment'

// View層の支払い予定型
export interface ViewUpcomingPayment extends Omit<BaseUpcomingPayment, 'amount' | 'dueDate'> {
  dueDate: string
  amount: number
}

// View層のAPIレスポンス型
export interface ViewApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string
}

// エラーレスポンスの型
export interface ViewApiErrorResponse {
  success: false
  error: string
  details?: string
}

// 成功レスポンスの型
export interface ViewApiSuccessResponse<T> {
  success: true
  data: T
}