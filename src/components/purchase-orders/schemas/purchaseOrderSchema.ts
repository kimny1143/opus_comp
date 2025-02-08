import { z } from 'zod'
import { PurchaseOrderStatus } from '@prisma/client'
import {
  dateValidation,
  stringValidation,
  arrayValidation,
  numberValidation
} from '@/types/validation/commonValidation'
import { itemSchema } from '@/types/validation/item'
import { tagSchema } from '@/types/validation/tag'
import { Prisma } from '@prisma/client'

// 品目のバリデーション強化
const enhancedItemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, '品目名は必須です').max(100, '品目名は100文字以内で入力してください'),
  quantity: z.number()
    .or(z.string().transform(val => Number(val)))
    .or(z.instanceof(Prisma.Decimal).transform(val => Number(val)))
    .refine(val => !isNaN(val) && val > 0, '数量は1以上を入力してください')
    .transform(val => new Prisma.Decimal(val)),
  unitPrice: z.number()
    .or(z.string().transform(val => Number(val)))
    .or(z.instanceof(Prisma.Decimal).transform(val => Number(val)))
    .refine(val => !isNaN(val) && val >= 0, '単価は0以上を入力してください')
    .transform(val => new Prisma.Decimal(val)),
  taxRate: z.number()
    .or(z.string().transform(val => Number(val)))
    .or(z.instanceof(Prisma.Decimal).transform(val => Number(val)))
    .refine(val => !isNaN(val) && (val === 0.08 || val === 0.1), '税率は8%または10%を選択してください')
    .transform(val => new Prisma.Decimal(val)),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  category: z.enum(['GOODS', 'SERVICE', 'IT_EQUIPMENT', 'SOFTWARE_LICENSE', 'CONSULTING', 'OTHER']).default('GOODS')
})

// ステータスの選択肢
export const PURCHASE_ORDER_STATUS_OPTIONS = [
  { value: PurchaseOrderStatus.DRAFT, label: '下書き' },
  { value: PurchaseOrderStatus.PENDING, label: '保留中' },
  { value: PurchaseOrderStatus.SENT, label: '送信済み' },
  { value: PurchaseOrderStatus.COMPLETED, label: '納品完了' },
  { value: PurchaseOrderStatus.REJECTED, label: '却下' },
  { value: PurchaseOrderStatus.OVERDUE, label: '期限超過' }
] as const

/**
 * 発注書のバリデーションスキーマ
 */
export const purchaseOrderSchema = z.object({
  orderNumber: z.string()
    .min(1, '発注番号は必須です')
    .max(50, '発注番号は50文字以内で入力してください')
    .regex(/^PO-\d+$/, '発注番号は"PO-"で始まる数字である必要があります'),
  vendorId: stringValidation.required,
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: 'ステータスは必須です',
    invalid_type_error: '無効なステータスです'
  }),
  orderDate: dateValidation.required,
  deliveryDate: dateValidation.required,
  items: z.array(enhancedItemSchema)
    .min(1, '品目は1つ以上入力してください')
    .max(50, '品目数は50個以内にしてください'),
  notes: stringValidation.optional,
  tags: z.array(tagSchema).optional().default([])
}).refine(data => {
  // 納期は発注日以降
  return data.deliveryDate >= data.orderDate
}, {
  message: '納期は発注日以降の日付を指定してください',
  path: ['deliveryDate']
}).refine(data => {
  // 納期は1年以内
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  return data.deliveryDate <= oneYearFromNow
}, {
  message: '納期は1年以内の日付を指定してください',
  path: ['deliveryDate']
})

/**
 * 発注書フォームデータの型定義
 */
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

/**
 * 発注書フォームの初期値
 */
export const defaultPurchaseOrderFormData: PurchaseOrderFormData = {
  orderNumber: `PO-${Date.now()}`,
  status: PurchaseOrderStatus.DRAFT,
  orderDate: new Date(),
  deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  items: [{
    itemName: '',
    quantity: new Prisma.Decimal(1),
    unitPrice: new Prisma.Decimal(0),
    taxRate: new Prisma.Decimal(0.1),
    description: '',
    category: 'GOODS'
  }],
  notes: '',
  tags: [],
  vendorId: ''
}