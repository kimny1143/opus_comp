import { describe, it, expect } from 'vitest'
import { itemSchema, defaultItem } from '../item'

describe('itemSchema', () => {
  const validItem = {
    itemName: 'テスト商品',
    quantity: 1,
    unitPrice: 1000,
    taxRate: 10,
    description: '商品の説明'
  }

  describe('基本的なバリデーション', () => {
    it('全ての必須項目が入力されている場合バリデーションが通る', () => {
      const result = itemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('必須項目が未入力の場合エラーになる', () => {
      const invalidItem = { ...validItem, itemName: '' }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('必須項目です')
      }
    })
  })

  describe('quantity', () => {
    it('1以上の整数の場合バリデーションが通る', () => {
      const result = itemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('0以下の場合エラーになる', () => {
      const invalidItem = { ...validItem, quantity: 0 }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('0より大きい値を入力してください')
      }
    })

    it('小数の場合エラーになる', () => {
      const invalidItem = { ...validItem, quantity: 1.5 }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('整数を入力してください')
      }
    })
  })

  describe('unitPrice', () => {
    it('正の整数の場合バリデーションが通る', () => {
      const result = itemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('0の場合エラーになる', () => {
      const invalidItem = { ...validItem, unitPrice: 0 }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('0より大きい値を入力してください')
      }
    })

    it('負の数の場合エラーになる', () => {
      const invalidItem = { ...validItem, unitPrice: -1000 }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('0より大きい値を入力してください')
      }
    })

    it('最大値（999999999）の場合バリデーションが通る', () => {
      const validMaxItem = { ...validItem, unitPrice: 999999999 }
      const result = itemSchema.safeParse(validMaxItem)
      expect(result.success).toBe(true)
    })

    it('最大値を超える場合エラーになる', () => {
      const invalidItem = { ...validItem, unitPrice: 1000000000 }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('999999999以下の値を入力してください')
      }
    })

    it('小数の場合エラーになる', () => {
      const invalidItem = { ...validItem, unitPrice: 1000.5 }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('整数を入力してください')
      }
    })
  })

  describe('taxRate', () => {
    it('8-10%の範囲内の場合バリデーションが通る', () => {
      [8, 9, 10].forEach(rate => {
        const result = itemSchema.safeParse({ ...validItem, taxRate: rate })
        expect(result.success).toBe(true)
      })
    })

    it('8%未満の場合エラーになる', () => {
      const invalidItem = { ...validItem, taxRate: 7 }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('税率は8%以上を入力してください')
      }
    })

    it('10%を超える場合エラーになる', () => {
      const invalidItem = { ...validItem, taxRate: 11 }
      const result = itemSchema.safeParse(invalidItem)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('税率は10%以下を入力してください')
      }
    })
  })

  describe('description', () => {
    it('説明が未入力の場合もバリデーションが通る', () => {
      const itemWithoutDesc = { ...validItem, description: '' }
      const result = itemSchema.safeParse(itemWithoutDesc)
      expect(result.success).toBe(true)
    })

    it('説明が入力されている場合もバリデーションが通る', () => {
      const result = itemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })
  })

  describe('defaultItem', () => {
    it('デフォルト値のスキーマ検証が通る', () => {
      const result = itemSchema.safeParse(defaultItem)
      expect(result.success).toBe(true)
    })

    it('全てのフィールドが存在する', () => {
      const fields = ['itemName', 'quantity', 'unitPrice', 'taxRate', 'description']
      fields.forEach(field => {
        expect(defaultItem).toHaveProperty(field)
      })
    })
  })
})

describe('明細行のバリデーション', () => {
  describe('itemName', () => {
    it('品目名が入力されている場合バリデーションが通る', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        itemName: 'テスト商品'
      })
      expect(result.success).toBe(true)
    })

    it('品目名が空の場合エラーになる', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        itemName: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('品目名は必須です')
      }
    })
  })

  describe('quantity', () => {
    it('数量が1以上の場合バリデーションが通る', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        quantity: 1
      })
      expect(result.success).toBe(true)
    })

    it('数量が0以下の場合エラーになる', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        quantity: 0
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('数量は0より大きい値を入力してください')
      }
    })

    it('数量が小数の場合エラーになる', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        quantity: 1.5
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('整数を入力してください')
      }
    })
  })

  describe('unitPrice', () => {
    it('単価が0以上の場合バリデーションが通る', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        unitPrice: 1000
      })
      expect(result.success).toBe(true)
    })

    it('単価が負の数の場合エラーになる', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        unitPrice: -1000
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('単価は0以上を入力してください')
      }
    })
  })

  describe('taxRate', () => {
    it('税率が10%の場合バリデーションが通る', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        taxRate: 0.1
      })
      expect(result.success).toBe(true)
    })

    it('税率が10%未満の場合エラーになる', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        taxRate: 0.08
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('インボイス制度に基づき、税率は10%以上を入力してください')
      }
    })

    it('税率が100%を超える場合エラーになる', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        taxRate: 1.1
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('税率は100%以下を入力してください')
      }
    })

    it('税率が小数点以下2桁に丸められる', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        taxRate: 0.123
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.taxRate).toBe(0.12)
      }
    })
  })

  describe('description', () => {
    it('説明が入力されている場合バリデーションが通る', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        description: '商品の説明'
      })
      expect(result.success).toBe(true)
    })

    it('説明が未入力の場合もバリデーションが通る', () => {
      const result = itemSchema.safeParse({
        ...defaultItem,
        description: undefined
      })
      expect(result.success).toBe(true)
    })
  })

  describe('defaultItem', () => {
    it('デフォルト値のスキーマ検証が通る', () => {
      const result = itemSchema.safeParse(defaultItem)
      expect(result.success).toBe(true)
    })

    it('全てのフィールドが存在する', () => {
      const requiredFields = ['itemName', 'quantity', 'unitPrice', 'taxRate']
      requiredFields.forEach(field => {
        expect(defaultItem).toHaveProperty(field)
      })
    })
  })
}) 