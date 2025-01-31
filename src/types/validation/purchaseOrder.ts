import { z } from 'zod'
import { baseValidationMessages, baseValidationRules } from './base'
import { numberValidation } from './number'
import { PurchaseOrderStatus } from '@prisma/client'

/**
 * 発注書の品目バリデーションスキーマ
 */
export const purchaseOrderItemSchema = z.object({
  id: z.string().optional(),
  itemName: baseValidationRules.requiredString.min(2, baseValidationMessages.minLength(2)),
  description: baseValidationRules.optionalString,
  quantity: numberValidation.quantity,
  unitPrice: numberValidation.positivePrice,
  taxRate: numberValidation.defaultTaxRate,
  amount: z.number().optional()
})

/**
 * 発注書のバリデーションスキーマ
 */
export const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, baseValidationMessages.required),
  orderDate: baseValidationRules.requiredDate,
  deliveryDate: baseValidationRules.futureDate.nullable(),
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: 'ステータスは必須です',
    invalid_type_error: '無効なステータスです'
  }),
  description: baseValidationRules.optionalString,
  items: baseValidationRules.nonEmptyArray(purchaseOrderItemSchema),
  terms: baseValidationRules.optionalString,
  tags: z.array(z.object({
    id: z.string().optional(),
    name: baseValidationRules.requiredString
  })).optional()
}).refine(
  data => {
    if (data.deliveryDate && data.orderDate) {
      return data.deliveryDate > data.orderDate
    }
    return true
  },
  {
    message: '納期は発注日より後の日付を指定してください',
    path: ['deliveryDate']
  }
)

/**
 * ステータス変更時のバリデーションスキーマ
 */
export const statusChangeSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: 'ステータスは必須です',
    invalid_type_error: '無効なステータスです'
  }),
  comment: z.string().optional()
}).refine(
  data => {
    // ステータスが REJECTED の場合はコメントを必須とする
    if (data.status === PurchaseOrderStatus.REJECTED && !data.comment) {
      return false
    }
    return true
  },
  {
    message: '却下理由を入力してください',
    path: ['comment']
  }
)

/**
 * 型定義のエクスポート
 */
export type PurchaseOrderItem = z.infer<typeof purchaseOrderItemSchema>
export type PurchaseOrderData = z.infer<typeof purchaseOrderSchema>
export type StatusChangeData = z.infer<typeof statusChangeSchema>

/**
 * バリデーションエラーの型
 */
export type ValidationError = {
  path: (string | number)[]
  message: string
}

/**
 * バリデーションエラーをフォーマットする関数
 */
export const formatValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.errors.map(err => ({
    path: err.path,
    message: err.message
  }))
}

/**
 * バリデーションエラーメッセージを取得する関数
 */
export const getFieldError = (
  errors: ValidationError[] | null,
  path: (string | number)[]
): string | null => {
  if (!errors) return null
  const error = errors.find(err => 
    err.path.length === path.length && 
    err.path.every((value, index) => value === path[index])
  )
  return error ? error.message : null
}