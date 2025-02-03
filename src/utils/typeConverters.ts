import { DbUpcomingPayment } from '@/types/db/payment'
import { ViewUpcomingPayment } from '@/types/view/payment'

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
 */
export const createSuccessResponse = <T>(data: T) => ({
  success: true as const,
  data
})

/**
 * APIレスポンスのエラーケース
 */
export const createErrorResponse = (error: string, details?: string) => ({
  success: false as const,
  error,
  details
})