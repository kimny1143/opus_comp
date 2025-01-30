import { z } from 'zod'
import { baseValidationMessages } from './base'

/**
 * 数値バリデーションルール
 */
export const numberValidation = {
  // 数量（1以上の整数）
  quantity: z.number()
    .positive(baseValidationMessages.positiveNumber)
    .int(baseValidationMessages.integerNumber),
  
  // システム全体での税率許容範囲（0-100%）
  systemTaxRate: z.number()
    .min(0, '税率は0%以上を入力してください')
    .max(1, '税率は100%以下を入力してください'),
  
  // UI/フォームでのデフォルト税率（8-10%）
  defaultTaxRate: z.number()
    .min(0.08, '税率は8%以上を入力してください')
    .max(0.1, '税率は10%以下を入力してください'),
  
  // 金額（1以上999,999,999以下の整数）
  positivePrice: z.number()
    .positive(baseValidationMessages.positiveNumber)
    .max(999999999, baseValidationMessages.maxNumber(999999999))
    .int(baseValidationMessages.integerNumber)
} as const

/**
 * 金額関連の型定義
 */
export type Price = z.infer<typeof numberValidation.positivePrice>
export type SystemTaxRate = z.infer<typeof numberValidation.systemTaxRate>
export type DefaultTaxRate = z.infer<typeof numberValidation.defaultTaxRate>
export type Quantity = z.infer<typeof numberValidation.quantity> 