import { z } from 'zod'
import { PurchaseOrderStatus } from '@prisma/client'
import {
  commonSchemas,
  stringValidation,
  dateValidation
} from '@/types/validation/commonValidation'
import { validationMessages } from '@/lib/validations/messages'
import { Prisma } from '@prisma/client'

// 品目のバリデーションスキーマ
const itemSchema = z.object({
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

// 発注書作成用のスキーマ
const purchaseOrderBaseSchema = {
  orderNumber: z.string()
    .min(1, '発注番号は必須です')
    .max(50, '発注番号は50文字以内で入力してください')
    .regex(/^PO-\d+$/, '発注番号は"PO-"で始まる数字である必要があります'),
  vendorId: stringValidation.required,
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: validationMessages.validation.invalid,
    invalid_type_error: validationMessages.validation.invalidStatus
  }).default('DRAFT'),
  orderDate: dateValidation.required,
  deliveryDate: dateValidation.required,
  items: z.array(itemSchema).min(1, validationMessages.validation.arrayMinLength),
  notes: stringValidation.optional,
  tags: z.array(commonSchemas.tag).default([])
} as const

export const purchaseOrderCreateSchema = z.object(purchaseOrderBaseSchema).refine(
  (data) => data.deliveryDate >= data.orderDate,
  {
    message: '納期は発注日以降の日付を指定してください',
    path: ['deliveryDate']
  }
)

// 発注書更新用のスキーマ
export const purchaseOrderUpdateSchema = z.object({
  ...Object.fromEntries(
    Object.entries(purchaseOrderBaseSchema).map(([key, schema]) => [key, schema.optional()])
  )
}).refine(
  (data) => !data.deliveryDate || !data.orderDate || data.deliveryDate >= data.orderDate,
  {
    message: '納期は発注日以降の日付を指定してください',
    path: ['deliveryDate']
  }
)

// 発注書ステータス更新用のスキーマ
export const purchaseOrderStatusUpdateSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: validationMessages.validation.invalid,
    invalid_type_error: validationMessages.validation.invalidStatus
  })
}).refine(
  (data) => {
    // ステータス遷移のバリデーション
    const validTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
      DRAFT: ['PENDING', 'SENT'],
      PENDING: ['SENT', 'REJECTED'],
      SENT: ['COMPLETED', 'REJECTED'],
      COMPLETED: [],
      REJECTED: ['DRAFT'],
      OVERDUE: ['PENDING']
    }
    return validTransitions[data.status].length > 0
  },
  {
    message: '無効なステータス遷移です',
    path: ['status']
  }
)

// バルクアクション用のスキーマ
export const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(['delete', 'updateStatus']),
  status: z.nativeEnum(PurchaseOrderStatus).optional()
})

export type PurchaseOrderCreateInput = z.infer<typeof purchaseOrderCreateSchema>
export type PurchaseOrderUpdateInput = z.infer<typeof purchaseOrderUpdateSchema>
export type PurchaseOrderStatusUpdateInput = z.infer<typeof purchaseOrderStatusUpdateSchema>