import { Prisma } from '@prisma/client';
import { TagFormData } from '../tag';
import { AccountType } from '@/types/bankAccount';

// 基本的な請求書ステータス定義
export const INVOICE_STATUS = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  SENT: '送信済み',
  REJECTED: '却下',
  OVERDUE: '期限超過',
  APPROVED: '承認済み',
  PAID: '支払済み',
  REVIEWING: '確認中'
} as const;

export type InvoiceStatus = keyof typeof INVOICE_STATUS;

// 基本的な請求書アイテム型
export interface BaseInvoiceItem {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number | string | Prisma.Decimal;
  taxRate: number | string | Prisma.Decimal;
  description: string;
  invoiceId?: string;
}

// 基本的な請求書型
export interface BaseInvoice {
  id?: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  items: BaseInvoiceItem[];
  notes?: string;
  bankInfo?: {
    accountType: AccountType;
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolder: string;
  };
  vendorId: string;
  tags?: TagFormData[];
  registrationNumber: string;
  totalAmount?: number | string | Prisma.Decimal;
  createdAt?: Date;
  updatedAt?: Date;
  purchaseOrderId?: string;
  invoiceNumber?: string;
  templateId?: string;
  createdById?: string;
  updatedById?: string;
}

// 税計算関連の基本型
export interface BaseTaxSummary {
  byRate: {
    taxRate: number;
    taxableAmount: number | string | Prisma.Decimal;
    taxAmount: number | string | Prisma.Decimal;
  }[];
  totalTaxableAmount: number | string | Prisma.Decimal;
  totalTaxAmount: number | string | Prisma.Decimal;
}

// 型変換ユーティリティのための共通インターフェース
export interface BaseInvoiceConversion {
  toBaseInvoice: (data: any) => BaseInvoice;
  fromBaseInvoice: (base: BaseInvoice) => any;
}

// テスト用ファクトリ関数
export const createTestInvoiceItem = (overrides?: Partial<BaseInvoiceItem>): BaseInvoiceItem => ({
  id: 'test-item-id',
  itemName: 'テスト商品',
  quantity: 1,
  unitPrice: new Prisma.Decimal(1000),
  taxRate: new Prisma.Decimal(0.1),
  description: 'テスト説明',
  ...overrides
});

export const createTestInvoice = (overrides?: Partial<BaseInvoice>): BaseInvoice => ({
  id: 'test-invoice-id',
  status: 'DRAFT',
  issueDate: new Date('2025-02-01'),
  dueDate: new Date('2025-03-01'),
  items: [createTestInvoiceItem()],
  bankInfo: {
    accountType: AccountType.ORDINARY,
    bankName: 'テスト銀行',
    branchName: 'テスト支店',
    accountNumber: '1234567',
    accountHolder: 'テスト太郎'
  },
  notes: 'テスト備考',
  vendorId: 'test-vendor-id',
  tags: [{ name: 'テストタグ' }],
  registrationNumber: 'T1234567890123',
  templateId: undefined,
  createdById: undefined,
  updatedById: undefined,
  ...overrides
});