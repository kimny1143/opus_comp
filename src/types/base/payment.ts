import { Prisma } from '@prisma/client'

// 基本的な支払い予定の型
export interface BaseUpcomingPayment {
  id: string
  dueDate: string | Date
  amount: number | Prisma.Decimal
  vendorName: string
}

// APIレスポンスの基本型
export interface BaseApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}