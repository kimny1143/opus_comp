import { z } from 'zod'
import { commonValidation } from './commonValidation'
import { Prisma } from '@prisma/client'

/**
 * 商品項目のバリデーションスキーマ
 */
export const itemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, '必須項目です'),
  quantity: z.number()
    .int('整数を入力してください')
    .min(1, '0より大きい値を入力してください'),
  unitPrice: z.union([
    z.number()
      .int('整数を入力してください')
      .min(1, '0より大きい値を入力してください')
      .max(999999999, '999999999以下の値を入力してください'),
    z.any().refine((val) => val instanceof Prisma.Decimal, {
      message: '単価は数値である必要があります'
    })
  ]).transform(val => 
    typeof val === 'string' ? new Prisma.Decimal(parseFloat(val)) : val
  ),
  taxRate: z.union([
    z.number()
      .min(0.08, '税率は8%以上を入力してください')
      .max(0.1, '税率は10%以下を入力してください')
      .transform(val => Number(val.toFixed(2))), // 小数点以下2桁に丸める
    z.any().refine((val) => val instanceof Prisma.Decimal, {
      message: '税率は数値である必要があります'
    })
  ]).transform(val => 
    typeof val === 'string' ? new Prisma.Decimal(parseFloat(val)) : val
  ),
  description: z.string().optional()
}).required()

/**
 * 商品項目の型定義
 */
export type Item = {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number | Prisma.Decimal;
  taxRate: number | Prisma.Decimal;
  description?: string;
}

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