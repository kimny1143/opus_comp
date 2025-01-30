import { z } from 'zod'
import { commonValidation } from './commonValidation'

/**
 * 商品項目のバリデーションスキーマ
 */
export const itemSchema = z.object({
  itemName: commonValidation.string.required,
  quantity: z.number().min(1, '数量は1以上を指定してください'),
  unitPrice: z.number().min(0, '単価は0以上を指定してください'),
  taxRate: commonValidation.number.taxRate.default,
  description: commonValidation.string.description
})

/**
 * 商品項目の型定義
 */
export type Item = z.infer<typeof itemSchema>

/**
 * 商品項目の初期値
 */
export const defaultItem: Item = {
  itemName: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0.1,
  description: ''
}

// 商品項目配列の型定義
export type Items = Item[]

// 商品項目配列の初期値
export const defaultItems: Items = [] 