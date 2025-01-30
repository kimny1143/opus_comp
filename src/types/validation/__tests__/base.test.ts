import { describe, it, expect } from 'vitest'
import { baseValidationMessages, baseValidationRules } from '../base'

describe('基本的なバリデーションルール', () => {
  describe('requiredString', () => {
    it('空文字列でない場合バリデーションが通る', () => {
      const result = baseValidationRules.requiredString.safeParse('テスト')
      expect(result.success).toBe(true)
    })

    it('空文字列の場合エラーになる', () => {
      const result = baseValidationRules.requiredString.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(baseValidationMessages.required)
      }
    })
  })

  describe('email', () => {
    it('有効なメールアドレスの場合バリデーションが通る', () => {
      const result = baseValidationRules.email.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('無効なメールアドレスの場合エラーになる', () => {
      const result = baseValidationRules.email.safeParse('invalid-email')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(baseValidationMessages.invalidEmail)
      }
    })
  })

  describe('phone', () => {
    it('数字とハイフンのみの場合バリデーションが通る', () => {
      const result = baseValidationRules.phone.safeParse('03-1234-5678')
      expect(result.success).toBe(true)
    })

    it('数字とハイフン以外が含まれる場合エラーになる', () => {
      const result = baseValidationRules.phone.safeParse('03(1234)5678')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(baseValidationMessages.invalidPhone)
      }
    })
  })

  describe('requiredDate', () => {
    it('有効な日付の場合バリデーションが通る', () => {
      const result = baseValidationRules.requiredDate.safeParse(new Date())
      expect(result.success).toBe(true)
    })

    it('無効な日付の場合エラーになる', () => {
      const result = baseValidationRules.requiredDate.safeParse('invalid-date')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(baseValidationMessages.invalidDate)
      }
    })
  })

  describe('pastDate', () => {
    it('過去の日付の場合バリデーションが通る', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const result = baseValidationRules.pastDate.safeParse(pastDate)
      expect(result.success).toBe(true)
    })

    it('未来の日付の場合エラーになる', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const result = baseValidationRules.pastDate.safeParse(futureDate)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(baseValidationMessages.pastDate)
      }
    })
  })

  describe('futureDate', () => {
    it('未来の日付の場合バリデーションが通る', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const result = baseValidationRules.futureDate.safeParse(futureDate)
      expect(result.success).toBe(true)
    })

    it('過去の日付の場合エラーになる', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const result = baseValidationRules.futureDate.safeParse(pastDate)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(baseValidationMessages.futureDate)
      }
    })
  })

  describe('nonEmptyArray', () => {
    it('要素が1つ以上ある場合バリデーションが通る', () => {
      const result = baseValidationRules.nonEmptyArray(baseValidationRules.requiredString).safeParse(['テスト'])
      expect(result.success).toBe(true)
    })

    it('空配列の場合エラーになる', () => {
      const result = baseValidationRules.nonEmptyArray(baseValidationRules.requiredString).safeParse([])
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(baseValidationMessages.minItems(1))
      }
    })
  })
}) 