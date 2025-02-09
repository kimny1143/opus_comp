import { Invoice as PrismaInvoice, InvoiceStatus as PrismaInvoiceStatus } from '@prisma/client'

export type InvoiceStatus = PrismaInvoiceStatus

export interface Invoice extends Omit<PrismaInvoice, 'totalAmount'> {
  totalAmount: string
  taxIncluded: boolean
}

export type CreateInvoiceInput = {
  vendorId: string
  amount: number
  taxIncluded?: boolean
}

export type UpdateInvoiceInput = {
  amount?: number
  status?: InvoiceStatus
  taxIncluded?: boolean
}

export type InvoiceWithVendor = Invoice & {
  vendor: {
    name: string
    email: string
    address?: string | null
  }
}

// 金額のフォーマット用ユーティリティ関数
export const formatAmount = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return numAmount.toLocaleString()
}
