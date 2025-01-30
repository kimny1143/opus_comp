import { z } from 'zod'
import { PurchaseOrderStatus } from '@prisma/client'
import {
  commonSchemas,
  dateValidation,
  stringValidation,
  validationMessages,
  arrayValidation
} from '@/types/validation/commonValidation'

// 発注書項目のスキーマ
export const purchaseOrderItemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, '品目名は必須です'),
  description: z.string().optional().nullable(),
  quantity: z.number().min(1, '数量は1以上を入力してください'),
  unitPrice: z.number().min(0, '単価は0以上を入力してください'),
  taxRate: z.number().min(0).max(1, '税率は0〜100%の範囲で入力してください'),
  amount: z.number().optional()
})

// 発注書のスキーマ
export const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, validationMessages.required),
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
  }),
  orderDate: dateValidation.required,
  deliveryDate: dateValidation.required,
  notes: stringValidation.optional,
  items: arrayValidation.nonEmpty(commonSchemas.item),
  tags: z.array(commonSchemas.tag).default([])
}).refine(data => {
  return data.deliveryDate >= data.orderDate
}, {
  message: '納品予定日は発注日より後の日付を指定してください',
  path: ['deliveryDate']
})

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

// ステータスの選択肢
export const PURCHASE_ORDER_STATUS_OPTIONS = [
  { value: PurchaseOrderStatus.DRAFT, label: '下書き' },
  { value: PurchaseOrderStatus.PENDING, label: '保留中' },
  { value: PurchaseOrderStatus.SENT, label: '送信済み' },
  { value: PurchaseOrderStatus.COMPLETED, label: '納品完了' },
  { value: PurchaseOrderStatus.REJECTED, label: '却下' },
  { value: PurchaseOrderStatus.OVERDUE, label: '期限超過' }
] 