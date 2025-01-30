import { describe, it, expect } from 'vitest'
import { invoiceSchema, defaultInvoiceFormData } from '../invoice'
import { InvoiceStatus } from '@prisma/client'
import { addDays } from 'date-fns'
import { systemOrderItemSchema } from '@/components/forms/schemas/orderSchema'

describe('請求書のバリデーション', () => {
  const validInvoiceData = {
    status: InvoiceStatus.DRAFT,
    issueDate: new Date(),
    dueDate: addDays(new Date(), 30),
    items: [{
      itemName: 'テスト商品',
      quantity: 1,
      unitPrice: 1000,
      taxRate: 0.1,
      description: '商品の説明'
    }],
    bankInfo: {
      bankName: 'テスト銀行',
      branchName: 'テスト支店',
      accountType: 'ORDINARY',
      accountNumber: '1234567',
      accountHolder: 'テスト太郎'
    },
    notes: 'テスト用備考',
    vendorId: 'test-vendor-id',
    tags: [{
      name: 'テストタグ'
    }],
    registrationNumber: 'T1234567890123',
    allowExtendedTaxRates: false
  }

  describe('基本的なバリデーション', () => {
    it('有効なデータの場合バリデーションが通る', () => {
      const result = invoiceSchema.safeParse(validInvoiceData)
      expect(result.success).toBe(true)
    })

    it('必須項目が未入力の場合エラーになる', () => {
      const invalidData = { ...validInvoiceData, vendorId: '' }
      const result = invoiceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('取引先を選択してください')
      }
    })
  })

  describe('日付のバリデーション', () => {
    it('支払期限が発行日より前の場合エラーになる', () => {
      const invalidData = {
        ...validInvoiceData,
        dueDate: addDays(validInvoiceData.issueDate, -1)
      }
      const result = invoiceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('支払期限は発行日以降の日付を指定してください')
      }
    })

    it('発行日が必須', () => {
      const invalidData = {
        ...validInvoiceData,
        issueDate: undefined
      }
      const result = invoiceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('日付を入力してください')
      }
    })
  })

  describe('明細行のバリデーション', () => {
    it('明細行が1つ以上必要', () => {
      const invalidData = {
        ...validInvoiceData,
        items: []
      }
      const result = invoiceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('品目は1つ以上必要です')
      }
    })

    it('明細行の必須項目が未入力の場合エラーになる', () => {
      const invalidData = {
        ...validInvoiceData,
        items: [{
          itemName: '',
          quantity: 1,
          unitPrice: 1000,
          taxRate: 0.1
        }]
      }
      const result = invoiceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('品目名は必須です')
      }
    })

    it('数量が0以下の場合エラーになる', () => {
      const invalidData = {
        ...validInvoiceData,
        items: [{
          itemName: 'テスト商品',
          quantity: 0,
          unitPrice: 1000,
          taxRate: 0.1
        }]
      }
      const result = invoiceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('数量は0より大きい値を入力してください')
      }
    })

    it('税率が不正な場合エラーになる', () => {
      const invalidData = {
        ...validInvoiceData,
        items: [{
          itemName: 'テスト商品',
          quantity: 1,
          unitPrice: 1000,
          taxRate: 0.05  // 8%未満
        }]
      }
      const result = invoiceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('税率は8%以上を入力してください')
      }
    })
  })

  describe('登録番号のバリデーション', () => {
    it('正しい形式の登録番号の場合バリデーションが通る', () => {
      const result = invoiceSchema.safeParse(validInvoiceData)
      expect(result.success).toBe(true)
    })

    it('不正な形式の登録番号の場合エラーになる', () => {
      const invalidData = {
        ...validInvoiceData,
        registrationNumber: '12345'  // 不正な形式
      }
      const result = invoiceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('登録番号はTで始まる13桁の数字である必要があります')
      }
    })
  })

  describe('デフォルト値', () => {
    it('デフォルト値のスキーマ検証が通る', () => {
      const result = invoiceSchema.safeParse({
        ...defaultInvoiceFormData,
        vendorId: 'test-vendor-id',
        registrationNumber: 'T1234567890123'
      })
      expect(result.success).toBe(true)
    })

    it('全ての必須フィールドが存在する', () => {
      const requiredFields = [
        'issueDate',
        'dueDate',
        'items',
        'bankInfo',
        'vendorId',
        'registrationNumber'
      ]
      requiredFields.forEach(field => {
        expect(defaultInvoiceFormData).toHaveProperty(field)
      })
    })
  })

  describe('税率のバリデーション', () => {
    it('デフォルトでは8-10%の範囲内の税率のみ許可', () => {
      const validData = {
        ...validInvoiceData,
        items: [{
          ...validInvoiceData.items[0],
          taxRate: 0.08
        }]
      }
      expect(invoiceSchema.safeParse(validData).success).toBe(true)

      const invalidLowData = {
        ...validInvoiceData,
        items: [{
          ...validInvoiceData.items[0],
          taxRate: 0.07
        }]
      }
      expect(invoiceSchema.safeParse(invalidLowData).success).toBe(false)

      const invalidHighData = {
        ...validInvoiceData,
        items: [{
          ...validInvoiceData.items[0],
          taxRate: 0.11
        }]
      }
      expect(invoiceSchema.safeParse(invalidHighData).success).toBe(false)
    })

    it('allowExtendedTaxRates=trueの場合、0-100%の範囲を許可', () => {
      const validData = {
        ...validInvoiceData,
        allowExtendedTaxRates: true,
        items: [{
          ...validInvoiceData.items[0],
          taxRate: 0.05 // 5%
        }]
      }
      const result = systemOrderItemSchema.safeParse(validData.items[0])
      expect(result.success).toBe(true)

      const validZeroData = {
        ...validInvoiceData,
        allowExtendedTaxRates: true,
        items: [{
          ...validInvoiceData.items[0],
          taxRate: 0 // 0%
        }]
      }
      const zeroResult = systemOrderItemSchema.safeParse(validZeroData.items[0])
      expect(zeroResult.success).toBe(true)

      const invalidData = {
        ...validInvoiceData,
        allowExtendedTaxRates: true,
        items: [{
          ...validInvoiceData.items[0],
          taxRate: 1.5 // 150%
        }]
      }
      const invalidResult = systemOrderItemSchema.safeParse(invalidData.items[0])
      expect(invalidResult.success).toBe(false)
    })
  })
}) 