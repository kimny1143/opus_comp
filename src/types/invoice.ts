import { Prisma, InvoiceStatus, Invoice as PrismaInvoice, Vendor } from '@prisma/client'

export { InvoiceStatus }

export const InvoiceStatusValues = [
  'DRAFT',
  'PENDING',
  'REVIEWING',
  'APPROVED',
  'PAID',
  'OVERDUE',
  'REJECTED'
] as const

export const InvoiceStatusDisplay: Record<InvoiceStatus, string> = {
  DRAFT: '下書き',
  PENDING: '保留中',
  REVIEWING: '確認中',
  APPROVED: '承認済み',
  PAID: '支払済み',
  OVERDUE: '期限超過',
  REJECTED: '却下'
}

export type BankInfo = {
  bankName: string
  branchName: string
  accountType: 'ordinary' | 'current'
  accountNumber: string
  accountHolder: string
}

export interface InvoiceItem {
  id?: string
  itemName: string
  quantity: number
  unitPrice: Prisma.Decimal
  taxRate: Prisma.Decimal
  description: string | null
  amount?: Prisma.Decimal
}

export interface InvoiceCreateInput {
  vendorId: string
  purchaseOrderId?: string
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  items: InvoiceItem[]
  notes: string
  bankInfo: BankInfo
  paymentTerms?: string
}

export interface InvoiceTemplateItem {
  id?: string
  itemName: string
  quantity: number
  unitPrice: number | string | Prisma.Decimal
  taxRate: number | string | Prisma.Decimal
  description?: string | null
  amount?: number
}

export interface InvoiceTemplate {
  id: string
  name: string
  description?: string
  bankInfo: BankInfo
  defaultItems?: InvoiceTemplateItem[]
  contractorName: string
  contractorAddress: string
  registrationNumber: string
  paymentTerms?: string
}

export interface ExtendedInvoice extends Invoice {
  vendor: Vendor
  items: InvoiceItem[]
  bankInfo: BankInfo
  notes: string | null
  purchaseOrder?: {
    id: string
    orderNumber: string
    status: string
    vendorId: string
    vendor?: {
      name: string
      address: string | null
    }
  } | null
  template: {
    id: string
    bankInfo: BankInfo
    contractorName: string
    contractorAddress: string
    registrationNumber: string
    paymentTerms?: string
  }
  total?: number
  taxAmount?: number
  paymentDate?: Date
  paymentMethod?: string
  contractorName?: string
  contractorAddress?: string
  registrationNumber?: string
}

export type InvoiceWithRelations = ExtendedInvoice;

export interface Invoice extends PrismaInvoice {
  vendor: Vendor
  items: InvoiceItem[]
  bankInfo: BankInfo
  notes: string | null
  purchaseOrder?: {
    id: string
    orderNumber: string
    status: string
    vendorId: string
    vendor?: {
      name: string
      address: string | null
    }
  } | null
  template: {
    id: string
    bankInfo: BankInfo
    contractorName: string
    contractorAddress: string
    registrationNumber: string
    paymentTerms?: string
  }
  total?: number
  taxAmount?: number
  paymentDate?: Date
  paymentMethod?: string
  contractorName?: string
  contractorAddress?: string
  registrationNumber?: string
} 