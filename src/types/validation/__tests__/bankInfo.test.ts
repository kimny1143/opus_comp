import { describe, it, expect } from 'vitest'
import { bankInfoSchema, defaultBankInfo } from '../bankInfo'

describe('bankInfoSchema', () => {
  describe('基本的なバリデーション', () => {
    it('全ての必須項目が入力されている場合バリデーションが通る', () => {
      const validBankInfo = {
        bankName: 'テスト銀行',
        branchName: 'テスト支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountName: 'テスト口座'
      }
      const result = bankInfoSchema.safeParse(validBankInfo)
      expect(result.success).toBe(true)
    })

    it('必須項目が未入力の場合エラーになる', () => {
      const result = bankInfoSchema.safeParse({
        branchName: 'テスト支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountName: 'テスト口座'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('必須項目です')
      }
    })
  })

  describe('accountType', () => {
    it('有効な口座種別の場合バリデーションが通る', () => {
      const validTypes = ['普通', '当座']
      validTypes.forEach(type => {
        const result = bankInfoSchema.safeParse({
          bankName: 'テスト銀行',
          branchName: 'テスト支店',
          accountType: type,
          accountNumber: '1234567',
          accountName: 'テスト口座'
        })
        expect(result.success).toBe(true)
      })
    })

    it('無効な口座種別の場合エラーになる', () => {
      const result = bankInfoSchema.safeParse({
        bankName: 'テスト銀行',
        branchName: 'テスト支店',
        accountType: '無効な種別',
        accountNumber: '1234567',
        accountName: 'テスト口座'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('口座種別は普通または当座を選択してください')
      }
    })
  })

  describe('accountNumber', () => {
    it('数字のみの場合バリデーションが通る', () => {
      const result = bankInfoSchema.safeParse({
        bankName: 'テスト銀行',
        branchName: 'テスト支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountName: 'テスト口座'
      })
      expect(result.success).toBe(true)
    })

    it('数字以外が含まれる場合エラーになる', () => {
      const result = bankInfoSchema.safeParse({
        bankName: 'テスト銀行',
        branchName: 'テスト支店',
        accountType: '普通',
        accountNumber: '123abc',
        accountName: 'テスト口座'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('口座番号は数字のみ使用できます')
      }
    })
  })

  describe('defaultBankInfo', () => {
    it('デフォルト値のスキーマ検証が通る', () => {
      const result = bankInfoSchema.safeParse(defaultBankInfo)
      expect(result.success).toBe(true)
    })

    it('全てのフィールドが存在する', () => {
      const requiredFields = ['bankName', 'branchName', 'accountType', 'accountNumber', 'accountName']
      requiredFields.forEach(field => {
        expect(defaultBankInfo).toHaveProperty(field)
      })
    })
  })
}) 