import { DbUpcomingPayment } from '@/types/db/payment'
import { ViewUpcomingPayment } from '@/types/view/payment'
import {
  BaseApiSuccessResponse,
  BaseApiErrorResponse,
  ApiErrorCode,
  ApiErrorMessage,
  createApiError
} from '@/types/base/api'

/**
 * DB層の支払い予定をView層に変換
 */
export const toViewUpcomingPayment = (db: DbUpcomingPayment): ViewUpcomingPayment => ({
  id: db.id,
  dueDate: db.dueDate.toISOString(),
  amount: db.amount.toNumber(),
  vendorName: db.vendorName
})

/**
 * 複数の支払い予定をまとめて変換
 */
export const toViewUpcomingPayments = (dbPayments: DbUpcomingPayment[]): ViewUpcomingPayment[] => {
  return dbPayments.map(toViewUpcomingPayment)
}

/**
 * APIレスポンスの成功ケース
 * @template T レスポンスデータの型
 */
export const createSuccessResponse = <T>(data: T): BaseApiSuccessResponse<T> => ({
  success: true,
  data
})

/**
 * APIレスポンスのエラーケース
 * @param code エラーコード
 * @param details エラーの詳細(オプション)
 */
export const createErrorResponse = (
  code: ApiErrorCode,
  details?: string
): BaseApiErrorResponse => createApiError(code, details)

/**
 * 認証エラーレスポンスを作成
 */
export const createUnauthorizedResponse = (): BaseApiErrorResponse => 
  createApiError(ApiErrorCode.UNAUTHORIZED)

/**
 * バリデーションエラーレスポンスを作成
 */
export const createValidationErrorResponse = (details: string): BaseApiErrorResponse =>
  createApiError(ApiErrorCode.VALIDATION_ERROR, details)

/**
 * 内部エラーレスポンスを作成
 */
export const createInternalErrorResponse = (details?: string): BaseApiErrorResponse =>
  createApiError(ApiErrorCode.INTERNAL_ERROR, details)