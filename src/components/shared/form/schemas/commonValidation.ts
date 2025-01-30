/**
 * @deprecated 新しい共通バリデーション（src/types/validation/commonValidation.ts）を使用してください。
 * より拡張性の高い設計と、UI/API層での一貫したバリデーションを提供します。
 */

import { z } from 'zod'

// 数値関連の共通バリデーション
/**
 * @deprecated 新しい共通バリデーション（src/types/validation/commonValidation.ts）のnumberValidationを使用してください
 */
export const numberValidation = {
  required: z.number().min(0, '0以上の数値を入力してください'),
  quantity: z.number().min(1, '数量は1以上を指定してください'),
  taxRate: z.number().min(0.1, '税率は0.1以上を指定してください'),
  price: z.number().min(0, '金額は0以上を指定してください')
}

// 日付関連の共通バリデーション
/**
 * @deprecated 新しい共通バリデーション（src/types/validation/commonValidation.ts）のdateValidationを使用してください
 */
export const dateValidation = {
  required: z.date({
    required_error: '日付は必須です',
    invalid_type_error: '無効な日付です'
  }),
  
  optional: z.date({
    invalid_type_error: '有効な日付を入力してください'
  }).optional()
}

// 文字列関連の共通バリデーション
/**
 * @deprecated 新しい共通バリデーション（src/types/validation/commonValidation.ts）のstringValidationを使用してください
 */
export const stringValidation = {
  required: z.string().min(1, '必須項目です'),
  name: z.string().min(1, '名前は必須です'),
  description: z.string().optional(),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号は必須です').regex(/^[0-9-]+$/, '電話番号は数字とハイフンのみ使用できます'),
  address: z.string().min(1, '住所は必須です'),
  accountNumber: z.string().min(1, '口座番号は必須です').regex(/^[0-9]+$/, '口座番号は数字のみ使用できます')
}

// 配列関連の共通バリデーション
/**
 * @deprecated 新しい共通バリデーション（src/types/validation/commonValidation.ts）のarrayValidationを使用してください
 */
export const arrayValidation = {
  nonEmpty: <T extends z.ZodTypeAny>(schema: T) => z.array(schema).min(1, '1つ以上の項目が必要です')
} 