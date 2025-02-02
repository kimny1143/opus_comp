import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  BaseInvoice,
  BaseInvoiceItem,
  BaseVendor,
  BaseInvoiceTemplate,
  BaseIssuer
} from '@/types/base/invoice';
import { InvoiceStatus } from '@/domains/invoice/status';
import { ItemCategory } from '@/types/itemCategory';
import { AccountType } from '@/types/bankAccount';

/**
 * テスト用の請求書明細項目を作成
 */
export const createTestInvoiceItem = (overrides?: Partial<BaseInvoiceItem>): BaseInvoiceItem => ({
  id: 'test-item-id',
  invoiceId: 'test-invoice-id',
  itemName: 'テスト商品',
  description: '商品の説明',
  quantity: 1,
  unitPrice: new Prisma.Decimal('1000'),
  taxRate: new Prisma.Decimal('0.10'),
  category: ItemCategory.ELECTRONICS,
  ...overrides
});

/**
 * テスト用の請求書を作成
 */
export const createTestInvoice = (overrides?: Partial<BaseInvoice>): BaseInvoice => ({
  id: 'test-invoice-id',
  templateId: 'test-template-id',
  purchaseOrderId: 'test-po-id',
  invoiceNumber: 'INV-2025-001',
  status: 'DRAFT' as InvoiceStatus,
  issueDate: new Date('2025-01-01'),
  dueDate: new Date('2025-01-31'),
  notes: 'テスト用請求書',
  bankInfo: {
    bankName: 'テスト銀行',
    branchName: 'テスト支店',
    accountType: AccountType.ORDINARY,
    accountNumber: '1234567',
    accountHolder: 'テスト太郎'
  },
  items: [createTestInvoiceItem()],
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  createdById: 'test-user-id',
  updatedById: null,
  vendorId: 'test-vendor-id',
  totalAmount: new Prisma.Decimal('1100'),
  ...overrides
});

/**
 * テスト用の取引先を作成
 */
export const createTestVendor = (overrides?: Partial<BaseVendor>): BaseVendor => ({
  id: 'test-vendor-id',
  name: 'テスト取引先',
  registrationNumber: 'T1234567890123',
  address: '東京都千代田区テスト1-1-1',
  tel: '03-1234-5678',
  email: 'test@example.com',
  ...overrides
});

/**
 * テスト用の請求書テンプレートを作成
 */
export const createTestInvoiceTemplate = (
  overrides?: Partial<BaseInvoiceTemplate>
): BaseInvoiceTemplate => ({
  id: 'test-template-id',
  name: 'テストテンプレート',
  description: 'テスト用のテンプレート',
  bankInfo: {
    bankName: 'テスト銀行',
    branchName: 'テスト支店',
    accountType: AccountType.ORDINARY,
    accountNumber: '1234567',
    accountHolder: 'テスト太郎'
  },
  contractorName: 'テスト株式会社',
  contractorAddress: '東京都千代田区テスト1-1-1',
  registrationNumber: 'T1234567890123',
  paymentTerms: '請求書発行後30日以内',
  ...overrides
});

/**
 * テスト用の発行者情報を作成
 */
export const createTestIssuer = (overrides?: Partial<BaseIssuer>): BaseIssuer => ({
  name: 'テスト発行者',
  registrationNumber: 'T1234567890123',
  address: '東京都千代田区テスト1-1-1',
  tel: '03-1234-5678',
  email: 'issuer@example.com',
  ...overrides
});