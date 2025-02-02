import { Prisma } from '@prisma/client';
import { ItemCategory } from '@/types/itemCategory';
import { DbTaxSummary } from '@/types/base/tax';

/**
 * PDF生成用の会社情報
 */
export interface PdfCompanyInfo {
  name: string;
  postalCode: string;
  address: string;
  tel: string;
  email: string;
  registrationNumber?: string;
}

/**
 * PDF生成用の請求書明細項目
 */
export interface PdfInvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  description?: string | null;
  category: ItemCategory;  // 必須に変更
  taxAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;

  // 金額計算メソッド
  calculateTaxableAmount(): Prisma.Decimal;
  calculateTaxAmount(): Prisma.Decimal;
  calculateTotalAmount(): Prisma.Decimal;
}

/**
 * PDF生成用の発行者情報
 */
export interface PdfIssuerInfo {
  name: string;
  registrationNumber: string;
  address: string;
  tel?: string;
  email?: string;
  logoUrl?: string;
}

/**
 * PDF生成用の取引先情報
 */
export interface PdfVendorInfo {
  id: string;
  name: string;
  address: string;
  registrationNumber: string;
  tel?: string;
  email?: string;
}

/**
 * PDF生成用の請求書
 */
export interface PdfInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate?: Date | null;
  notes?: string | null;
  status: string;
  vendor: PdfVendorInfo;
  issuer: PdfIssuerInfo;
  items: PdfInvoiceItem[];
  taxSummary: DbTaxSummary;
  subtotal: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;

  // バリデーション
  validate(): boolean;
}

/**
 * PDFのレイアウト設定
 */
export interface PdfLayoutOptions {
  pageSize: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  font?: {
    family: string;
    size: number;
  };
}

/**
 * PDF生成エラー
 */
export class PdfGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PdfGenerationError';
  }
}

/**
 * PDFのバリデーションエラー
 */
export class PdfValidationError extends Error {
  constructor(
    message: string,
    public errors: string[]
  ) {
    super(message);
    this.name = 'PdfValidationError';
  }
}