import { Prisma } from '@prisma/client'
import { BaseUpcomingPayment } from '../base/payment'

// DB層の支払い予定型
export interface DbUpcomingPayment extends Omit<BaseUpcomingPayment, 'amount' | 'dueDate'> {
  dueDate: Date
  amount: Prisma.Decimal
}

// DB層のAPIレスポンス型
export interface DbApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
  code?: string
  meta?: Record<string, unknown>
}