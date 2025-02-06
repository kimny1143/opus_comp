import { Prisma } from '@prisma/client'
import type { BankInfo, StatusHistory, Tag } from '../base/common'
import type { BaseInvoiceItem, InvoiceStatus, InvoiceTaxSummary } from '../base/invoice'

/**
 * データベース層の請求書アイテム
 */
export interface DbInvoiceItem extends BaseInvoiceItem {
  invoiceId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * データベース層の請求書テンプレート
 */
export interface DbInvoiceTemplate {
  id: string
  registrationNumber: string
  name: string
  description: string | null
  notes: string
  paymentTerms: string
  createdAt: Date
  updatedAt: Date
  userId: string
  contractorName: string
  contractorAddress: string
  bankInfo: BankInfo
  defaultItems: Prisma.JsonValue
}

/**
 * データベース層の請求書
 */
export interface DbInvoice {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  notes: string
  templateId: string | null
  purchaseOrderId: string | null
  bankInfo: Prisma.JsonValue | null
  template: DbInvoiceTemplate | null
  items: DbInvoiceItem[]
  vendor: {
    id: string
    name: string
    registrationNumber: string
  }
  vendorId: string
  totalAmount: Prisma.Decimal
  taxAmount: Prisma.Decimal
  taxSummary: InvoiceTaxSummary
  tags: Tag[]
  statusHistory: StatusHistory[]
  createdAt: Date
  updatedAt: Date
  createdById: string
  updatedById: string
}

/**
 * データベース層の請求書作成入力
 */
export interface DbInvoiceCreateInput {
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  notes: string
  templateId?: string
  purchaseOrderId?: string
  bankInfo: Prisma.JsonValue
  vendorId: string
  items: {
    create: Omit<DbInvoiceItem, 'id' | 'invoiceId' | 'createdAt' | 'updatedAt'>[]
  }
  tags?: {
    connect: { id: string }[]
  }
  totalAmount: Prisma.Decimal
  taxAmount: Prisma.Decimal
  taxSummary: Prisma.JsonValue
  createdById: string
  updatedById: string
}

/**
 * データベース層の請求書更新入力
 */
export interface DbInvoiceUpdateInput {
  status?: InvoiceStatus
  issueDate?: Date
  dueDate?: Date
  notes?: string
  bankInfo?: Prisma.JsonValue
  items?: {
    deleteMany: {}
    create: Omit<DbInvoiceItem, 'id' | 'invoiceId' | 'createdAt' | 'updatedAt'>[]
  }
  tags?: {
    set: { id: string }[]
  }
  totalAmount?: Prisma.Decimal
  taxAmount?: Prisma.Decimal
  taxSummary?: Prisma.JsonValue
  updatedById: string
}

/**
 * データベース層の請求書検索条件
 */
export interface DbInvoiceWhereInput {
  status?: { in: InvoiceStatus[] }
  issueDate?: { gte: Date }
  dueDate?: { lte: Date }
  vendorId?: string
  totalAmount?: {
    gte?: number
    lte?: number
  }
  tags?: {
    some: {
      id: { in: string[] }
    }
  }
  OR?: [
    { invoiceNumber: { contains: string } },
    { notes: { contains: string } },
    { vendor: { name: { contains: string } } }
  ]
}