import { Prisma, Invoice, InvoiceStatus, Vendor, InvoiceItem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type InvoiceStatusType = InvoiceStatus;

export const InvoiceStatusValues = {
  DRAFT: InvoiceStatus.DRAFT,
  PENDING: InvoiceStatus.PENDING,
  REVIEWING: InvoiceStatus.REVIEWING,
  APPROVED: InvoiceStatus.APPROVED,
  PAID: InvoiceStatus.PAID,
  OVERDUE: InvoiceStatus.OVERDUE,
  REJECTED: InvoiceStatus.REJECTED
} as const;

export const InvoiceStatusDisplay: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: '下書き',
  [InvoiceStatus.PENDING]: '保留中',
  [InvoiceStatus.REVIEWING]: '確認中',
  [InvoiceStatus.APPROVED]: '承認済み',
  [InvoiceStatus.PAID]: '支払済み',
  [InvoiceStatus.OVERDUE]: '支払期限超過',
  [InvoiceStatus.REJECTED]: '却下',
  [InvoiceStatus.SENT]: '送信済み'
};

export type BankInfo = Prisma.JsonObject & {
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountName: string;
};

export interface InvoiceTemplate {
  id: string;
  bankInfo: BankInfo;
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  paymentTerms?: string;
}

export interface QualifiedInvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  description: string | null;
  quantity: number;
  unitPrice: string;
  taxRate: number;
  taxAmount: number;
  taxableAmount: number;
}

export interface TaxableItem {
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: number;
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

export interface QualifiedVendor {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
}

export interface QualifiedInvoice extends Omit<Invoice, 'status' | 'items' | 'bankInfo'> {
  status: InvoiceStatusType;
  vendor: QualifiedVendor;
  template: InvoiceTemplate;
  issuer: InvoiceIssuer;
  taxSummary: InvoiceTaxSummary;
  items: QualifiedInvoiceItem[];
  bankInfo: BankInfo;
  vendorId: string;
  totalAmount: Decimal;
}

export type { InvoiceItem };  // Re-export InvoiceItem from @prisma/client 