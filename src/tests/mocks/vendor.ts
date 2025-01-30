import { VendorStatus, VendorCategory } from '@prisma/client'
import { VendorFormData } from '@/types/validation/vendor'
import { vendorSchema } from '@/types/validation/vendor'

/**
 * テスト用の取引先データを生成する
 */
export function createMockVendorData(overrides: Partial<VendorFormData> = {}): VendorFormData {
  const mockData: VendorFormData = {
    name: `テスト取引先_${Date.now()}`,
    code: `V${Date.now()}`,
    address: '東京都渋谷区...',
    contacts: [
      {
        name: 'テスト担当者1',
        email: 'test1@example.com',
        phone: '03-1234-5678',
        department: '営業部'
      }
    ],
    email: 'company@example.com',
    phone: '03-1234-5678',
    fax: '03-1234-5679',
    website: 'https://example.com',
    notes: 'テスト用データ',
    tags: [
      {
        id: '1',
        name: 'テスト'
      }
    ],
    registrationNumber: 'T1234567890123'
  }

  // スキーマによるバリデーション
  const validData = vendorSchema.parse({
    ...mockData,
    ...overrides
  })

  return validData
}

/**
 * テスト用の取引先データを複数生成する
 */
export function createMockVendors(count: number, overrides: Partial<VendorFormData> = {}) {
  return Array.from({ length: count }, (_, index) =>
    createMockVendorData({
      name: `テスト取引先_${index + 1}`,
      code: `V${index + 1}`,
      ...overrides
    })
  )
}

/**
 * テスト用の取引先データをDBモデル形式で生成する
 */
export function createMockVendorModel(overrides: Partial<VendorFormData> = {}) {
  const formData = createMockVendorData(overrides)
  return {
    id: `vendor_${Date.now()}`,
    ...formData,
    status: VendorStatus.ACTIVE,
    category: VendorCategory.CORPORATION,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user_1',
    updatedById: 'user_1'
  }
}

/**
 * テスト用の取引先データをDBモデル形式で複数生成する
 */
export function createMockVendorModels(count: number, overrides: Partial<VendorFormData> = {}) {
  return Array.from({ length: count }, () => createMockVendorModel(overrides))
} 