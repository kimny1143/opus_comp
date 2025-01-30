import { commonValidation } from '../commonValidation'
import { AccountType } from '@/types/bankAccount'
import { ZodError } from 'zod'

describe('commonValidation', () => {
  describe('number', () => {
    describe('taxRate', () => {
      describe('system', () => {
        it('0-100%の範囲を許容する', () => {
          const schema = commonValidation.number.taxRate.system
          
          // 有効な値
          expect(() => schema.parse(0)).not.toThrow()
          expect(() => schema.parse(0.5)).not.toThrow()
          expect(() => schema.parse(1)).not.toThrow()
          
          // 無効な値
          expect(() => schema.parse(-0.1)).toThrow()
          expect(() => schema.parse(1.1)).toThrow()
        })
      })
      
      describe('default', () => {
        it('8-10%の範囲を許容する', () => {
          const schema = commonValidation.number.taxRate.default
          
          // 有効な値
          expect(() => schema.parse(0.08)).not.toThrow()
          expect(() => schema.parse(0.1)).not.toThrow()
          
          // 無効な値
          expect(() => schema.parse(0.07)).toThrow()
          expect(() => schema.parse(0.11)).toThrow()
        })
      })
      
      describe('createCustom', () => {
        it('指定した範囲の税率を許容する', () => {
          const schema = commonValidation.number.taxRate.createCustom(0.05, 0.15)
          
          // 有効な値
          expect(() => schema.parse(0.05)).not.toThrow()
          expect(() => schema.parse(0.1)).not.toThrow()
          expect(() => schema.parse(0.15)).not.toThrow()
          
          // 無効な値
          expect(() => schema.parse(0.04)).toThrow()
          expect(() => schema.parse(0.16)).toThrow()
        })

        it('エラーメッセージが正しく設定される', () => {
          const schema = commonValidation.number.taxRate.createCustom(0.05, 0.15)
          
          try {
            schema.parse(0.04)
            fail('バリデーションエラーが発生するはずです')
          } catch (error) {
            if (error instanceof ZodError) {
              expect(error.errors[0].message).toBe('税率は5%以上を入力してください')
            } else {
              fail('ZodErrorが発生するはずです')
            }
          }

          try {
            schema.parse(0.16)
            fail('バリデーションエラーが発生するはずです')
          } catch (error) {
            if (error instanceof ZodError) {
              expect(error.errors[0].message).toBe('税率は15%以下を入力してください')
            } else {
              fail('ZodErrorが発生するはずです')
            }
          }
        })
      })
    })
  })

  describe('date', () => {
    describe('expirationDate', () => {
      it('基準日以降の日付を許容する', () => {
        const baseDate = new Date('2025-01-01')
        const schema = commonValidation.date.expirationDate(baseDate)
        
        // 有効な値
        expect(() => schema.parse(new Date('2025-01-02'))).not.toThrow()
        
        // 無効な値
        expect(() => schema.parse(new Date('2024-12-31'))).toThrow()
      })

      it('基準日が指定されない場合は現在日時が使用される', () => {
        const schema = commonValidation.date.expirationDate()
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1日後
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1日前
        
        expect(() => schema.parse(futureDate)).not.toThrow()
        expect(() => schema.parse(pastDate)).toThrow()
      })
    })
  })

  describe('string', () => {
    describe('description', () => {
      it('任意の文字列を許容する', () => {
        const schema = commonValidation.string.description
        
        expect(() => schema.parse('')).not.toThrow()
        expect(() => schema.parse('説明文')).not.toThrow()
        expect(() => schema.parse(undefined)).not.toThrow()
      })
    })

    describe('required', () => {
      it('空文字列を許容しない', () => {
        const schema = commonValidation.string.required
        
        expect(() => schema.parse('テスト')).not.toThrow()
        expect(() => schema.parse('')).toThrow()
      })
    })
  })

  describe('array', () => {
    describe('nonEmpty', () => {
      it('1つ以上の要素を持つ配列を許容する', () => {
        const schema = commonValidation.array.nonEmpty(commonValidation.string.required)
        
        expect(() => schema.parse(['テスト'])).not.toThrow()
        expect(() => schema.parse([])).toThrow()
      })
    })
  })
}) 