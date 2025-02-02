import { Prisma, Invoice as PrismaInvoice, Vendor, PurchaseOrder } from '@prisma/client'
import { InvoiceStatus } from '@/types/enums'
import { BankInfo } from '@/types/bankAccount'
import { TagFormData } from '@/types/tag'
import type { InvoiceFormData, InvoiceFormDataRHF } from '@/types/validation/invoice'
import { Decimal } from '@prisma/client/runtime/library'
import { DbTaxCalculation, DbTaxSummary } from '@/types/base/tax';
import { ItemCategory } from '@/types/itemCategory';

// 基本型定義
export type InvoiceStatusType = InvoiceStatus;
export type BankInfoNullable = BankInfo | null;

// DBモデル用の型定義
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

// フォーム用の型定義は validation/invoice から再エクスポート
export { type InvoiceFormData, type InvoiceFormDataRHF };

// API入力用の型定義
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

// テンプレート関連の型定義
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
  bankInfo: string;  // JSON文字列として保存
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  paymentTerms?: string;
}

export interface InvoiceTemplateWithParsedBankInfo extends Omit<InvoiceTemplate, 'bankInfo'> {
  bankInfo: BankInfo;
}

// 拡張インボイス型定義
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

// ステータス履歴の型定義
export interface InvoiceStatusHistoryItem {
  id: string;
  status: InvoiceStatus;
  createdAt: Date;
  user: {
    name: string | null;
  } | null;
}

// 拡張インボイスの詳細型定義
export interface ExtendedInvoice extends Omit<Invoice, 'bankInfo' | 'issueDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'template'> {
  items: (Omit<InvoiceItem, 'unitPrice' | 'taxRate'> & {
    unitPrice: Prisma.Decimal;
    taxRate: Prisma.Decimal;
  })[];
  vendor: Vendor;
  purchaseOrder: (Pick<PurchaseOrder, 'id' | 'orderNumber' | 'status' | 'vendorId'> & {
    vendor?: Pick<Vendor, 'name' | 'address'>;
  }) | null;
  template: InvoiceTemplateWithParsedBankInfo | null;
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

// シリアライズ用の型定義
export type SerializedInvoice = Omit<QualifiedInvoice, 'issueDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'totalAmount' | 'items' | 'taxSummary' | 'template' | 'vendor'> & {
  issueDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: string;
  taxAmount: string;
  total: string;
  items: {
    id: string;
    invoiceId: string;
    itemName: string;
    description: string | null;
    quantity: number;
    unitPrice: string;
    taxRate: string;
    taxAmount: string;
    taxableAmount: string;
  }[];
  taxSummary: {
    byRate: {
      taxRate: number;
      taxableAmount: string;
      taxAmount: string;
    }[];
    totalTaxableAmount: string;
    totalTaxAmount: string;
  };
  template: Omit<InvoiceTemplate, 'createdAt' | 'updatedAt'> & {
    createdAt?: string;
    updatedAt?: string;
  };
  vendor: QualifiedVendor;
}

export type InvoiceWithRelations = ExtendedInvoice;

// 税計算関連の型定義
export interface InvoiceTaxSummary extends DbTaxSummary {}

// 発行者情報の型定義
export interface InvoiceIssuer {
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
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
  category?: ItemCategory;
}

export interface TaxableItem {
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: number;
}

export interface QualifiedInvoice {
  id: string;
  templateId: string;
  purchaseOrderId: string;
  invoiceNumber: string;
  status: InvoiceStatusType;
  issueDate: Date;
  dueDate: Date;
  notes: string | null;
  bankInfo: BankInfo;
  vendor: QualifiedVendor;
  template: InvoiceTemplate;
  issuer: InvoiceIssuer;
  taxSummary: InvoiceTaxSummary;
  items: QualifiedInvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById: string | null;
  vendorId: string;
  totalAmount: Decimal;
}

export interface QualifiedVendor {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
}
