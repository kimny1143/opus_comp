import { z } from 'zod'
import { PurchaseOrderStatus } from '@prisma/client'
import { 
  dateValidation,
  stringValidation,
  arrayValidation
} from '@/types/validation/commonValidation'
import { itemSchema } from '@/types/validation/item'
import { tagSchema } from '@/types/validation/tag'
import { PURCHASE_ORDER_STATUS_OPTIONS } from '@/types/common'

/**
 * 発注書のバリデーションスキーマ
 */
export const purchaseOrderSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus),
  orderDate: dateValidation.required,
  deliveryDate: dateValidation.required,
  items: arrayValidation.nonEmpty(itemSchema),
  notes: stringValidation.description,
  vendorId: stringValidation.required,
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
  vendorId: '',
  tags: []
} 