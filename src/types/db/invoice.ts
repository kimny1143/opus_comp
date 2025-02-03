import { Prisma, Invoice as PrismaInvoice, Vendor } from '@prisma/client';
import { BaseInvoice, BaseInvoiceItem, InvoiceStatus } from '../base/invoice';
import { TagFormData } from '../tag';
import { AccountType } from '@/types/bankAccount';

// DB層の請求書アイテム型
export interface DbInvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  description: string;
  amount?: Prisma.Decimal;
}

// DB層の請求書型
export interface DbInvoice {
  id: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  totalAmount: Prisma.Decimal;
  vendor: Vendor;
  items: DbInvoiceItem[];
  notes: string;
  bankInfo: {
    accountType: AccountType;
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolder: string;
  };
  vendorId: string;
  tags: TagFormData[];
  registrationNumber: string;
  createdAt: Date;
  updatedAt: Date;
  purchaseOrderId: string;
  templateId: string;
  invoiceNumber: string;
  createdById: string;
  updatedById: string;
}

// DB層の税計算型
export interface DbTaxSummary {
  byRate: {
    taxRate: number;
    taxableAmount: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
  }[];
  totalTaxableAmount: Prisma.Decimal;
  totalTaxAmount: Prisma.Decimal;
}

// 型変換ユーティリティ
export const toDbInvoice = (base: BaseInvoice): Omit<DbInvoice, 'id' | 'vendor' | 'createdAt' | 'updatedAt'> => ({
  status: base.status,
  issueDate: base.issueDate,
  dueDate: base.dueDate,
  totalAmount: new Prisma.Decimal(base.totalAmount || 0),
  items: base.items.map(item => ({
    id: item.id || crypto.randomUUID(),
    invoiceId: item.invoiceId || '',
    itemName: item.itemName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: new Prisma.Decimal(item.unitPrice),
    taxRate: new Prisma.Decimal(item.taxRate),
    amount: new Prisma.Decimal(item.quantity).mul(new Prisma.Decimal(item.unitPrice))
  })),
  notes: base.notes || '',
  bankInfo: base.bankInfo || {
    accountType: AccountType.ORDINARY,
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolder: ''
  },
  vendorId: base.vendorId,
  tags: base.tags || [],
  registrationNumber: base.registrationNumber,
  purchaseOrderId: base.purchaseOrderId || '',
  templateId: base.templateId || '',
  invoiceNumber: base.invoiceNumber || '',
  createdById: base.createdById || '',
  updatedById: base.updatedById || ''
});