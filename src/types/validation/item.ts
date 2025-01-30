import { z } from 'zod'
import { commonValidation } from './commonValidation'
import { Prisma } from '@prisma/client'

/**
 * 商品項目のバリデーションスキーマ
 */
export const itemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, '品目名を入力してください'),
  quantity: z.number().min(1, '数量は1以上を指定してください'),
  unitPrice: z.union([
    z.number(),
    z.any().refine((val) => val instanceof Prisma.Decimal, {
      message: '単価は数値である必要があります'
    })
  ]).transform(val => 
    typeof val === 'string' ? new Prisma.Decimal(parseFloat(val)) : val
  ),
  taxRate: z.union([
    z.number(),
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