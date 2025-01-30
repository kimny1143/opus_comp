import { z } from 'zod'
import {
  stringValidation,
  numberValidation,
  dateValidation,
  commonSchemas,
  type Tag,
  type BankInfo,
  type Item
} from '@/types/validation/commonValidation'

/**
 * フォーム用の共通スキーマ定義
 * @note UI層固有のバリデーションルールを定義
 */

// 基本的な入力フィールドのバリデーション
export const requiredString = stringValidation.required
export const optionalString = stringValidation.optional
export const email = stringValidation.email
export const phone = stringValidation.phone

// 金額関連のバリデーション
export const amount = numberValidation.amount
export const positiveAmount = numberValidation.price
export const taxRate = numberValidation.taxRate

// 日付関連のバリデーション
export const requiredDate = dateValidation.required
export const optionalDate = dateValidation.optional

// 共通スキーマの再エクスポート
export const { tag: tagSchema, bankInfo: bankInfoSchema, item: itemSchema } = commonSchemas

// 型定義の再エクスポート
export type { Tag, BankInfo, Item } 