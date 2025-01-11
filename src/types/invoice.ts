import { Prisma, Invoice as PrismaInvoice, Vendor } from '@prisma/client'
import { InvoiceStatus } from './enums'

export type InvoiceStatusType = InvoiceStatus;

export type BankInfo = {
  bankName: string;
  branchName: string;
  accountType: 'ordinary' | 'current';
  accountNumber: string;
  accountHolder: string;
};

export type BankInfoNullable = BankInfo | null;

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  itemName: string;
  description?: string | null;
  quantity: number;
  unitPrice: string;
  taxRate: string;
}

export interface InvoiceCreateInput {
  vendorId: string
  purchaseOrderId?: string
  status: InvoiceStatusType
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
  id: string;
  name?: string;
  bankInfo: BankInfo;
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  paymentTerms?: string;
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
  bankInfo: BankInfoNullable
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

export interface TaxCalculation {
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface InvoiceTaxSummary {
  byRate: TaxCalculation[];
  totalTaxableAmount: number;
  totalTaxAmount: number;
}

export interface InvoiceIssuer {
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
}