import { describe, it, expect } from 'vitest'
import { purchaseOrderSchema, DEPARTMENT_LIMITS } from '../purchaseOrderSchema'
import { PurchaseOrderStatus } from '@prisma/client'
import { Prisma } from '@prisma/client'

describe('purchaseOrderSchema', () => {
  // 有効なテストデータを作成するヘルパー関数
  const createValidPurchaseOrderData = (overrides = {}) => ({
    vendorId: 'vendor_1',
    status: PurchaseOrderStatus.DRAFT,
    orderDate: new Date(),
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1日後
    items: [
      {
        itemName: 'テスト商品',
        quantity: 1,
        unitPrice: 1000,
        taxRate: 0.10,
        category: 'GOODS'
      }
    ],
    notes: '',
    tags: [],
    department: 'GENERAL',
    ...overrides
  })

  describe('部門別の上限金額チェック', () => {
    it('一般部門の上限金額を超えない場合は有効', () => {
      const data = createValidPurchaseOrderData({
        department: 'GENERAL',
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 900000, // 90万円（税込99万円）
            taxRate: 0.10,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).not.toThrow()
    })

    it('一般部門の上限金額を超える場合はエラー', () => {
      const data = createValidPurchaseOrderData({
        department: 'GENERAL',
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 1000000, // 100万円（税込110万円）
            taxRate: 0.10,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).toThrow('発注総額が部門別の上限を超えています')
    })

    it('管理部門は高額な発注が可能', () => {
      const data = createValidPurchaseOrderData({
        department: 'MANAGEMENT',
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 4500000, // 450万円（税込495万円）
            taxRate: 0.10,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).not.toThrow()
    })
  })

  describe('品目数の上限チェック', () => {
    it('50品目以内の場合は有効', () => {
      const data = createValidPurchaseOrderData({
        items: Array.from({ length: 50 }, (_, i) => ({
          itemName: `商品${i + 1}`,
          quantity: 1,
          unitPrice: 1000,
          taxRate: 0.10,
          category: 'GOODS'
        }))
      })
      expect(() => purchaseOrderSchema.parse(data)).not.toThrow()
    })

    it('50品目を超える場合はエラー', () => {
      const data = createValidPurchaseOrderData({
        items: Array.from({ length: 51 }, (_, i) => ({
          itemName: `商品${i + 1}`,
          quantity: 1,
          unitPrice: 1000,
          taxRate: 0.10,
          category: 'GOODS'
        }))
      })
      expect(() => purchaseOrderSchema.parse(data)).toThrow('品目数は50個以内にしてください')
    })
  })

  describe('与信限度額チェック', () => {
    it('与信限度額を超えない場合は有効', () => {
      const data = createValidPurchaseOrderData({
        creditLimit: 2000000,
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 1000000, // 100万円（税込110万円）
            taxRate: 0.10,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).not.toThrow()
    })

    it('与信限度額を超える場合はエラー', () => {
      const data = createValidPurchaseOrderData({
        creditLimit: 1000000,
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 1000000, // 100万円（税込110万円）
            taxRate: 0.10,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).toThrow('発注総額が取引先の与信限度額を超えています')
    })
  })

  describe('特定カテゴリーの承認要否チェック', () => {
    it('通常カテゴリーは承認なしで送信可能', () => {
      const data = createValidPurchaseOrderData({
        status: PurchaseOrderStatus.SENT,
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 0.10,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).not.toThrow()
    })

    it('特定カテゴリーは承認なしで送信不可', () => {
      const data = createValidPurchaseOrderData({
        status: PurchaseOrderStatus.SENT,
        items: [
          {
            itemName: 'ソフトウェアライセンス',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 0.10,
            category: 'SOFTWARE_LICENSE'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).toThrow('特定カテゴリーの品目が含まれているため、承認が必要です')
    })

    it('特定カテゴリーは下書き状態で保存可能', () => {
      const data = createValidPurchaseOrderData({
        status: PurchaseOrderStatus.DRAFT,
        items: [
          {
            itemName: 'IT機器',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 0.10,
            category: 'IT_EQUIPMENT'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).not.toThrow()
    })
  })

  describe('税率のバリデーション', () => {
    it('8%と10%の税率は有効', () => {
      const data = createValidPurchaseOrderData({
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 0.08,
            category: 'GOODS',
            description: '軽減税率対象商品'
          },
          {
            itemName: '商品B',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 0.10,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).not.toThrow()
    })

    it('その他の税率はエラー', () => {
      const data = createValidPurchaseOrderData({
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 0.05,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).toThrow('無効な税率が指定されています')
    })
  })

  describe('重複品目チェック', () => {
    it('品目名が重複する場合はエラー', () => {
      const data = createValidPurchaseOrderData({
        items: [
          {
            itemName: '商品A',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 0.10,
            category: 'GOODS'
          },
          {
            itemName: '商品A', // 重複
            quantity: 2,
            unitPrice: 2000,
            taxRate: 0.10,
            category: 'GOODS'
          }
        ]
      })
      expect(() => purchaseOrderSchema.parse(data)).toThrow('同じ品目が複数登録されています')
    })
  })
}) 