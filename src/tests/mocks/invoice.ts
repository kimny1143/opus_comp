import { InvoiceStatus, Prisma } from '@prisma/client'
import { InvoiceFormData } from '@/types/validation/invoice'
import { invoiceSchema } from '@/types/validation/invoice'
import { createMockVendorModel } from './vendor'

/**
 * テスト用の請求書データを生成する
 */
export function createMockInvoiceData(overrides: Partial<InvoiceFormData> = {}): InvoiceFormData {
  const mockData: InvoiceFormData = {
    status: InvoiceStatus.DRAFT,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      {
        itemName: 'テスト商品1',
        quantity: 1,
        unitPrice: new Prisma.Decimal(1000),
        taxRate: new Prisma.Decimal(10),
        description: 'テスト用商品データ'
      }
    ],
    bankInfo: {
      accountType: 'ORDINARY',
      bankName: 'テスト銀行',
      branchName: 'テスト支店',
      accountNumber: '1234567',
      accountHolder: 'テスト太郎'
    },
    notes: 'テスト用データ',
    vendorId: 'vendor_1',
    purchaseOrderId: 'po_1',
    tags: [
      {
        id: '1',
        name: 'テスト'
      }
    ],
    registrationNumber: 'T1234567890123'
  }

  // スキーマによるバリデーション
  const validData = invoiceSchema.parse({
    ...mockData,
    ...overrides
  })

  return validData
}

/**
 * テスト用の請求書データを複数生成する
 */
export function createMockInvoices(count: number, overrides: Partial<InvoiceFormData> = {}) {
  return Array.from({ length: count }, (_, index) =>
    createMockInvoiceData({
      registrationNumber: `T${String(index + 1).padStart(13, '0')}`,
      ...overrides
    })
  )
}

/**
 * テスト用の請求書データをDBモデル形式で生成する
 */
export function createMockInvoiceModel(overrides: Partial<InvoiceFormData> = {}) {
  const formData = createMockInvoiceData(overrides)
  const vendor = createMockVendorModel()

  return {
    id: `invoice_${Date.now()}`,
    ...formData,
    vendor,
    totalAmount: '1100',
    taxAmount: '100',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user_1',
    updatedById: 'user_1'
  }
}

/**
 * テスト用の請求書データをDBモデル形式で複数生成する
 */
export function createMockInvoiceModels(count: number, overrides: Partial<InvoiceFormData> = {}) {
  return Array.from({ length: count }, () => createMockInvoiceModel(overrides))
} 