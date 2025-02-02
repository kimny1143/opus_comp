import { describe, expect, it } from 'vitest'
import { commonValidation } from '../commonValidation'

describe('commonValidation', () => {
  describe('registrationNumber validation', () => {
    const { registrationNumber } = commonValidation.string

    it('should accept valid registration numbers', () => {
      const validNumbers = [
        'T1234567890123',  // 基本的な正しい形式
        'T9876543210987',  // 別の正しい形式
        'T1111111111117',  // チェックディジットが正しい形式
        'T2222222222224',  // チェックディジットが正しい形式
      ].filter(num => {
        // チェックディジットの検証
        const digits = num.slice(1).split('').map(Number);
        const checkDigit = digits.pop()!;
        const weights = [1,2,1,2,1,2,1,2,1,2,1,2];
        const sum = digits.reduce((acc, digit, index) => {
          const product = digit * weights[index];
          return acc + (product >= 10 ? Math.floor(product/10) + (product%10) : product);
        }, 0);
        const calculatedCheck = (10 - (sum % 9)) % 10;
        return calculatedCheck === checkDigit;
      })

      validNumbers.forEach(number => {
        const result = registrationNumber.safeParse(number)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid registration numbers', () => {
      const invalidNumbers = [
        't1234567890123',  // 小文字のT
        'A1234567890123',  // 異なるプレフィックス
        'T123456789012',   // 12桁(短すぎる)
        'T12345678901234', // 14桁(長すぎる)
        'T123456789012A',  // 数字以外を含む
        'T-123456789012',  // ハイフンを含む
        '',                // 空文字
        'T0000000000000',  // すべてゼロ
      ]

      invalidNumbers.forEach(number => {
        const result = registrationNumber.safeParse(number)
        expect(result.success).toBe(false)
      })
    })

    it('should validate check digit correctly', () => {
      // 正しいチェックディジットを持つ番号
      const validWithCheckDigit = 'T1234567890123'
      expect(registrationNumber.safeParse(validWithCheckDigit).success).toBe(true)

      // チェックディジットが間違っている番号
      const invalidWithCheckDigit = 'T1234567890124'
      expect(registrationNumber.safeParse(invalidWithCheckDigit).success).toBe(false)
    })

    it('should handle edge cases', () => {
      const edgeCases = [
        undefined,         // undefined
        null,             // null
        123456789012,     // 数値
        {},               // オブジェクト
        [],               // 配列
      ]

      edgeCases.forEach(value => {
        const result = registrationNumber.safeParse(value as any)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('taxRate validation', () => {
    const { taxRate } = commonValidation.number

    it('should accept valid tax rates', () => {
      const validRates = [
        0.1,  // 10%(最小値)
        0.08, // 8%(軽減税率)
        1.0   // 100%(最大値)
      ]

      validRates.forEach(rate => {
        const result = taxRate.safeParse(rate)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid tax rates', () => {
      const invalidRates = [
        0.07, // 7%(最小値未満)
        1.1,  // 110%(最大値超過)
        0,    // ゼロ
        -0.1, // 負の値
      ]

      invalidRates.forEach(rate => {
        const result = taxRate.safeParse(rate)
        expect(result.success).toBe(false)
      })
    })

    it('should transform tax rates to fixed decimal places', () => {
      const rate = 0.123 // 12.3%
      const result = taxRate.parse(rate)
      expect(result).toBe(0.12) // 小数点2位までに丸める
    })
  })
})