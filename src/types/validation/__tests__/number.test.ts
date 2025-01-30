import { describe, it, expect } from 'vitest'
import { numberValidation } from '../number'

describe('numberValidation', () => {
  describe('quantity', () => {
    it('正の整数の場合バリデーションが通る', () => {
      const result = numberValidation.quantity.safeParse(1)
      expect(result.success).toBe(true)
    })

    it('0以下の場合エラーになる', () => {
      const result = numberValidation.quantity.safeParse(0)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('1以上の数値を入力してください')
      }
    })

    it('小数の場合エラーになる', () => {
      const result = numberValidation.quantity.safeParse(1.5)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('整数を入力してください')
      }
    })

    it('最大値（9999999）の場合バリデーションが通る', () => {
      const result = numberValidation.quantity.safeParse(9999999)
      expect(result.success).toBe(true)
    })

    it('最大値を超える場合エラーになる', () => {
      const result = numberValidation.quantity.safeParse(10000000)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('9999999以下の数値を入力してください')
      }
    })
  })

  describe('taxRate', () => {
    it('10%（0.1）以上の値の場合バリデーションが通る', () => {
      const result = numberValidation.taxRate.safeParse(0.1)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(0.1)
      }
    })

    it('10%未満の値の場合エラーになる', () => {
      const result = numberValidation.taxRate.safeParse(0.08)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('インボイス制度に基づき、税率は10%以上を入力してください')
      }
    })

    it('100%（1.0）の場合バリデーションが通る', () => {
      const result = numberValidation.taxRate.safeParse(1.0)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(1.0)
      }
    })

    it('100%を超える値の場合エラーになる', () => {
      const result = numberValidation.taxRate.safeParse(1.1)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('税率は100%以下を入力してください')
      }
    })

    it('小数点以下2桁に丸められる', () => {
      const result = numberValidation.taxRate.safeParse(0.123)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(0.12)
      }
    })
  })

  describe('positivePrice', () => {
    it('正の整数の場合バリデーションが通る', () => {
      const result = numberValidation.positivePrice.safeParse(1000)
      expect(result.success).toBe(true)
    })

    it('0の場合エラーになる', () => {
      const result = numberValidation.positivePrice.safeParse(0)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('1以上の数値を入力してください')
      }
    })

    it('負の数の場合エラーになる', () => {
      const result = numberValidation.positivePrice.safeParse(-1000)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('1以上の数値を入力してください')
      }
    })

    it('小数の場合エラーになる', () => {
      const result = numberValidation.positivePrice.safeParse(1000.5)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('整数を入力してください')
      }
    })

    it('最大値（999999999）の場合バリデーションが通る', () => {
      const result = numberValidation.positivePrice.safeParse(999999999)
      expect(result.success).toBe(true)
    })

    it('最大値を超える場合エラーになる', () => {
      const result = numberValidation.positivePrice.safeParse(1000000000)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('999999999以下の数値を入力してください')
      }
    })
  })
}) 