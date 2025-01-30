import { PurchaseOrderStatus } from '@prisma/client'
import { PurchaseOrderFormData } from '@/types/validation/purchaseOrder'
import { purchaseOrderSchema } from '@/types/validation/purchaseOrder'
import { createMockVendorModel } from './vendor'

/**
 * テスト用の発注書データを生成する
 */
export function createMockPurchaseOrderData(overrides: Partial<PurchaseOrderFormData> = {}): PurchaseOrderFormData {
  const mockData: PurchaseOrderFormData = {
    status: PurchaseOrderStatus.DRAFT,
    orderDate: new Date(),
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    items: [
      {
        name: 'テスト商品1',
        quantity: 1,
        unitPrice: 1000,
        taxRate: 10,
        description: 'テスト用商品データ'
      }
    ],
    notes: 'テスト用データ',
    vendorId: 'vendor_1',
    tags: [
      {
        id: '1',
        name: 'テスト'
      }
    ],
    deliveryAddress: '東京都渋谷区...',
    orderNumber: `PO${Date.now()}`
  }

  // スキーマによるバリデーション
  const validData = purchaseOrderSchema.parse({
    ...mockData,
    ...overrides
  })

  return validData
}

/**
 * テスト用の発注書データを複数生成する
 */
export function createMockPurchaseOrders(count: number, overrides: Partial<PurchaseOrderFormData> = {}) {
  return Array.from({ length: count }, (_, index) =>
    createMockPurchaseOrderData({
      orderNumber: `PO${String(index + 1).padStart(6, '0')}`,
      ...overrides
    })
  )
}

/**
 * テスト用の発注書データをDBモデル形式で生成する
 */
export function createMockPurchaseOrderModel(overrides: Partial<PurchaseOrderFormData> = {}) {
  const formData = createMockPurchaseOrderData(overrides)
  const vendor = createMockVendorModel()

  return {
    id: `po_${Date.now()}`,
    ...formData,
    vendor,
    totalAmount: '1100',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user_1',
    updatedById: 'user_1'
  }
}

/**
 * テスト用の発注書データをDBモデル形式で複数生成する
 */
export function createMockPurchaseOrderModels(count: number, overrides: Partial<PurchaseOrderFormData> = {}) {
  return Array.from({ length: count }, () => createMockPurchaseOrderModel(overrides))
} 