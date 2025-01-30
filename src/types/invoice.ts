import { Prisma, Invoice as PrismaInvoice, Vendor, PurchaseOrder, Tag } from '@prisma/client'
import { InvoiceStatus } from './enums'
import { BankInfo } from '@/types/bankAccount'
import { TagFormData } from '@/types/tag'

export type InvoiceStatusType = InvoiceStatus;

export type BankInfoNullable = BankInfo | null;

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  itemName: string;
  description?: string | null;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  amount?: number;
}

export interface InvoiceFormItem {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount?: number;
  description?: string;
}

export interface InvoiceFormData {
  id?: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceFormItem[];
  bankInfo: BankInfo;
  status?: InvoiceStatus;
  vendorId?: string;
  description?: string;
  invoiceNumber?: string;
  tags: TagFormData[];
}

export interface InvoiceCreateInput {
  vendorId?: string
  purchaseOrderId?: string
  status?: InvoiceStatusType
  issueDate?: Date
  dueDate?: Date
  items?: Array<{
    id?: string
    itemName: string
    quantity: number
    unitPrice: number | string | Prisma.Decimal
    taxRate: number | string | Prisma.Decimal
    description?: string
  }>
  notes?: string
  bankInfo?: BankInfo
  paymentTerms?: string
  invoiceNumber?: string
}

export interface InvoiceTemplateItem {
  id?: string
  itemName: string
  quantity: number
  unitPrice: Prisma.Decimal
  taxRate: Prisma.Decimal
  description?: string | null
  amount?: Prisma.Decimal
}

export interface InvoiceTemplate {
  id: string;
  name?: string;
  description?: string;
  bankInfo: BankInfo;
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  paymentTerms?: string;
}

export interface BaseInvoice extends Omit<PrismaInvoice, 'totalAmount'> {
  totalAmount: Prisma.Decimal;
  vendor: Vendor;
  items: InvoiceItem[];
  bankInfo: Prisma.JsonValue;
  notes: string | null;
  purchaseOrder?: {
    id: string;
    orderNumber: string;
    status: string;
    vendorId: string;
    vendor?: {
      name: string;
      address: string | null;
    };
  } | null;
  template?: {
    id: string;
    bankInfo: BankInfo;
    contractorName: string;
    contractorAddress: string;
    registrationNumber: string;
    paymentTerms?: string;
  } | null;
  tags?: TagFormData[];
}

export interface Invoice extends BaseInvoice {
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatusType;
  tags: TagFormData[];
}

export interface InvoiceStatusHistoryItem {
  id: string;
  status: InvoiceStatus;
  createdAt: Date;
  user: {
    name: string | null;
  } | null;
}

export interface ExtendedInvoice extends Omit<Invoice, 'bankInfo' | 'issueDate' | 'dueDate' | 'createdAt' | 'updatedAt'> {
  items: (Omit<InvoiceItem, 'unitPrice' | 'taxRate'> & {
    unitPrice: Prisma.Decimal;
    taxRate: Prisma.Decimal;
  })[];
  vendor: Vendor;
  purchaseOrder: (Pick<PurchaseOrder, 'id' | 'orderNumber' | 'status' | 'vendorId'> & {
    vendor?: Pick<Vendor, 'name' | 'address'>;
  }) | null;
  template: InvoiceTemplate | null;
  bankInfo: BankInfo;
  totalAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  total: Prisma.Decimal;
  statusHistory: InvoiceStatusHistoryItem[];
  issueDate: Date | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: TagFormData[];
  id: string;
  status: InvoiceStatus;
  vendorId: string;
  description?: string;
  invoiceNumber: string;
  createdById: string;
  updatedById: string | null;
}

export type SerializedInvoice = Omit<ExtendedInvoice, 'totalAmount' | 'taxAmount' | 'total' | 'items' | 'issueDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'bankInfo'> & {
  totalAmount: string;
  taxAmount: string;
  total: string;
  items: (Omit<InvoiceItem, 'unitPrice' | 'taxRate'> & {
    unitPrice: string;
    taxRate: string;
  })[];
  issueDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  bankInfo: BankInfo;
  tags: TagFormData[];
}

export type InvoiceWithRelations = ExtendedInvoice;

export interface TaxCalculation {
  taxRate: number;
  taxableAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
}

export interface InvoiceTaxSummary {
  byRate: TaxCalculation[];
  totalTaxableAmount: Prisma.Decimal;
  totalTaxAmount: Prisma.Decimal;
}

export interface InvoiceIssuer {
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
}
