import { QualifiedInvoice, QualifiedInvoiceItem } from '@/types/invoice';
import { TaxCalculation } from '@/types/tax';
import { Prisma } from '@prisma/client';
import { toDbTaxCalculation } from '@/utils/typeConverters/tax';

/**
 * テスト用のInvoiceItemを生成
 */
export const createTestInvoiceItem = (
  overrides: Partial<QualifiedInvoiceItem> = {}
): QualifiedInvoiceItem => ({
  id: '1',
  invoiceId: '1',
  itemName: 'テスト商品1',
  quantity: 2,
  unitPrice: '1000',
  taxRate: 10,
  description: '商品の説明1',
  taxAmount: 200,
  taxableAmount: 2000,
  ...overrides
});

/**
 * テスト用のTaxCalculationを生成
 */
export const createTestTaxCalculation = (
  overrides: Partial<TaxCalculation> = {}
): TaxCalculation => ({
  rate: 10,
  taxRate: 10,
  taxableAmount: '2000',
  taxAmount: '200',
  ...overrides
});

/**
 * テスト用のQualifiedInvoiceを生成
 */
export const createTestInvoice = (
  overrides: Partial<QualifiedInvoice> = {}
): QualifiedInvoice => ({
  id: '1',
  invoiceNumber: 'INV-001',
  issueDate: new Date('2025-02-01'),
  dueDate: new Date('2025-02-28'),
  status: 'DRAFT',
  notes: 'テスト用請求書',
  vendorId: '1',
  vendor: {
    id: '1',
    name: 'テスト取引先',
    address: '東京都渋谷区...',
    registrationNumber: 'T1234567890123'
  },
  issuer: {
    name: 'テスト発行者',
    email: 'issuer@example.com',
    registrationNumber: 'T9876543210123',
    address: '東京都千代田区...'
  },
  items: [createTestInvoiceItem()],
  taxSummary: {
    byRate: [toDbTaxCalculation(createTestTaxCalculation())],
    totalTaxableAmount: new Prisma.Decimal('2000'),
    totalTaxAmount: new Prisma.Decimal('200')
  },
  totalAmount: new Prisma.Decimal('2200'),
  templateId: null,
  purchaseOrderId: null,
  bankInfo: null,
  template: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: '1',
  updatedById: '1',
  ...overrides
});

/**
 * テスト用の会社情報を生成
 */
export const createTestCompanyInfo = (
  overrides: Partial<{
    name: string;
    postalCode: string;
    address: string;
    tel: string;
    email: string;
    registrationNumber?: string;
  }> = {}
) => ({
  name: 'テスト株式会社',
  postalCode: '123-4567',
  address: '東京都千代田区...',
  tel: '03-1234-5678',
  email: 'test@example.com',
  registrationNumber: 'T9876543210123',
  ...overrides
});