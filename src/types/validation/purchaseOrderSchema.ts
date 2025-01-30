import { z } from 'zod'
import { PurchaseOrderStatus } from '@prisma/client'
import { commonValidation } from './commonValidation'
import { itemSchema } from './item'
import { tagSchema } from './tag'

// 発注書ステータスのオプション
export const PURCHASE_ORDER_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '下書き' },
  { value: 'PENDING', label: '承認待ち' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'REJECTED', label: '却下' },
  { value: 'CANCELLED', label: 'キャンセル' }
] as const

/**
 * 発注書のバリデーションスキーマ
 */
export const purchaseOrderSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus),
  orderDate: commonValidation.date.required,
  deliveryDate: commonValidation.date.required,
  items: commonValidation.array.nonEmpty(itemSchema),
  notes: commonValidation.string.description,
  tags: z.array(tagSchema)
}).refine(
  (data) => {
    return data.deliveryDate >= data.orderDate
  },
  {
    message: '納期は発注日以降の日付を指定してください',
    path: ['deliveryDate']
  }
)

/**
 * 発注書フォームデータの型定義
 */
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

/**
 * 発注書フォームの初期値
 */
export const defaultPurchaseOrderFormData: PurchaseOrderFormData = {
  status: 'DRAFT',
  orderDate: new Date(),
  deliveryDate: new Date(),
  items: [],
  notes: '',
  tags: []
} 