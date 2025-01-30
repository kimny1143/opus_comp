import { z } from 'zod'
import { baseValidationMessages, baseValidationRules } from './base'
import { AccountType } from '../common'

/**
 * 銀行情報のバリデーションスキーマ
 */
export const bankInfoSchema = z.object({
  bankName: baseValidationRules.requiredString.min(1, '銀行名は必須です'),
  branchName: baseValidationRules.requiredString.min(1, '支店名は必須です'),
  accountType: z.enum(['ORDINARY', 'CURRENT', 'SAVINGS'] as const, {
    errorMap: () => ({ message: '口座種別を選択してください' })
  }),
  accountNumber: z.string()
    .min(1, '口座番号は必須です')
    .regex(/^[0-9]+$/, '口座番号は数字のみ使用できます'),
  accountHolder: baseValidationRules.requiredString.min(1, '口座名義は必須です')
})

/**
 * 銀行情報の型定義
 */
export type BankInfo = z.infer<typeof bankInfoSchema>

/**
 * 銀行情報の初期値
 */
export const defaultBankInfo: BankInfo = {
  bankName: '',
  branchName: '',
  accountType: 'ORDINARY',
  accountNumber: '',
  accountHolder: ''
} 