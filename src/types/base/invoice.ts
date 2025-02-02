import { Prisma, Invoice as PrismaInvoice } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { InvoiceStatus } from '@/domains/invoice/status';
import { BankInfo } from '@/types/bankAccount';
import { ItemCategory } from '@/types/itemCategory';
import { DbTaxSummary } from './tax';

/**
 * 基本的な請求書明細項目
 */
export interface BaseInvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  description: string | null;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  category?: ItemCategory;
}

/**
 * 基本的な請求書
 */
export interface BaseInvoice {
  id: string;
  templateId: string;
  purchaseOrderId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  notes: string | null;
  bankInfo: BankInfo;
  items: BaseInvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  updatedById: string | null;
  vendorId: string;
  totalAmount: Decimal;
}

/**
 * 基本的な取引先情報
 */
export interface BaseVendor {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
}

/**
 * 基本的な請求書テンプレート
 */
export interface BaseInvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  bankInfo: BankInfo;
  contractorName: string;
  contractorAddress: string;
  registrationNumber: string;
  paymentTerms?: string;
}

/**
 * 基本的な発行者情報
 */
export interface BaseIssuer {
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
}

/**
 * 税計算可能なアイテム
 */
export interface TaxableItem {
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: number;
}

/**
 * 請求書の税計算サマリー
 */
export interface InvoiceTaxSummary extends DbTaxSummary {}