import { z } from 'zod'
import { InvoiceStatus, PurchaseOrderStatus } from '@prisma/client'
import { AccountType, BankInfoOptional } from '@/types/bankAccount'
import { numberValidation } from '@/types/validation/number'

// 共通のアイテムスキーマ
export const orderItemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, '品目名は必須です'),
  description: z.string().optional().nullable(),
  quantity: z.number()
    .positive('数量は0より大きい値を入力してください')
    .min(1, '数量は1以上を入力してください'),
  unitPrice: z.number()
    .min(0, '単価は0以上を入力してください'),
  taxRate: numberValidation.defaultTaxRate,
  amount: z.number().optional()
})

// システム全体で使用する拡張アイテムスキーマ（0-100%の税率を許容）
export const systemOrderItemSchema = orderItemSchema.extend({
  taxRate: numberValidation.systemTaxRate
})

// 銀行情報スキーマ
export const bankInfoSchema = z.object({
  bankName: z.string().min(1, '銀行名は必須です'),
  branchName: z.string().min(1, '支店名は必須です'),
  accountType: z.enum(['ORDINARY', 'CURRENT', 'SAVINGS']),
  accountNumber: z.string().min(1, '口座番号は必須です'),
  accountHolder: z.string().min(1, '口座名義は必須です')
})

// 基本的な注文スキーマ
export const baseOrderSchema = z.object({
  vendorId: z.string().min(1, { message: '取引先は必須です' }),
  description: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, '明細は1つ以上必要です'),
  bankInfo: bankInfoSchema.optional(),
  notes: z.string().optional(),
  tags: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'タグ名は必須です')
  })).optional()
})

// 請求書スキーマ
export const invoiceSchema = baseOrderSchema.extend({
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
  issueDate: z.date({
    required_error: '発行日は必須です',
    invalid_type_error: '無効な日付です'
  }),
  dueDate: z.date({
    required_error: '支払期限は必須です',
    invalid_type_error: '無効な日付です'
  }),
  registrationNumber: z.string()
    .regex(/^T\d{13}$/, '登録番号はT+13桁の数字で入力してください')
    .optional(),
  purchaseOrderId: z.string().uuid('発注書IDが無効です').optional(),
  // 管理者設定によって税率の許容範囲を変更可能
  allowExtendedTaxRates: z.boolean().default(false)
}).refine(data => {
  if (data.dueDate) {
    return data.dueDate >= data.issueDate
  }
  return true
}, {
  message: '支払期限は発行日より後の日付を指定してください',
  path: ['dueDate']
})

// 発注書スキーマ
export const purchaseOrderSchema = baseOrderSchema.extend({
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: 'ステータスは必須です',
    invalid_type_error: '無効なステータスです'
  }),
  orderDate: z.date({
    required_error: '発注日は必須です',
    invalid_type_error: '無効な日付です'
  }),
  deliveryDate: z.date({
    required_error: '納期は必須です',
    invalid_type_error: '無効な日付です'
  }).nullable(),
  terms: z.string().optional().nullable(),
}).refine(data => {
  if (data.deliveryDate) {
    return data.deliveryDate >= data.orderDate
  }
  return true
}, {
  message: '納期は発注日より後の日付を指定してください',
  path: ['deliveryDate']
})

// 型定義のエクスポート
export type OrderItem = z.infer<typeof orderItemSchema>
export type BankInfo = z.infer<typeof bankInfoSchema>
export type BaseOrder = z.infer<typeof baseOrderSchema>
export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema> 