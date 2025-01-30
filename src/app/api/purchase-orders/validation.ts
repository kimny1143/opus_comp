import { z } from 'zod'
import { PurchaseOrderStatus } from '@prisma/client'
import {
  commonSchemas,
  stringValidation,
  dateValidation,
  validationMessages
} from '@/types/validation/commonValidation'

// 発注書作成用のスキーマ
const purchaseOrderBaseSchema = {
  vendorId: stringValidation.required,
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
  }).default('DRAFT'),
  orderDate: dateValidation.required,
  deliveryDate: dateValidation.required,
  items: z.array(commonSchemas.item).min(1, validationMessages.arrayMinLength),
  description: stringValidation.optional,
  terms: stringValidation.optional,
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
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
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