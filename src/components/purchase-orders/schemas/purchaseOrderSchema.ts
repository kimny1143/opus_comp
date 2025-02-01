import { z } from 'zod'
import { PurchaseOrderStatus } from '@prisma/client'
import {
  commonSchemas,
  dateValidation,
  stringValidation,
  validationMessages,
  arrayValidation,
  numberValidation
} from '@/types/validation/commonValidation'
import { itemSchema } from '@/types/validation/item'
import { tagSchema } from '@/types/validation/tag'
import { Prisma } from '@prisma/client'

// 部門別の上限金額設定
export const DEPARTMENT_LIMITS = {
  GENERAL: new Prisma.Decimal(1000000),    // 一般部門: 100万円
  MANAGEMENT: new Prisma.Decimal(5000000), // 管理部門: 500万円
  EXECUTIVE: new Prisma.Decimal(10000000)  // 役員: 1000万円
} as const

// 品目数の上限
const MAX_ITEMS = 50

// 商品カテゴリー別の承認要否
const CATEGORIES_REQUIRING_APPROVAL = ['IT_EQUIPMENT', 'SOFTWARE_LICENSE', 'CONSULTING'] as const

// 品目データのバリデーション強化
const enhancedItemSchema = itemSchema.extend({
  itemName: z.string().min(1, '品目名は必須です').max(100, '品目名は100文字以内で入力してください'),
  quantity: z.number()
    .min(1, '数量は1以上を入力してください')
    .max(9999999, '数量が大きすぎます')
    .transform(val => new Prisma.Decimal(val)),
  unitPrice: z.number()
    .min(0, '単価は0以上を入力してください')
    .max(999999999, '単価が大きすぎます')
    .transform(val => new Prisma.Decimal(val)),
  taxRate: z.number()
    .min(0, '税率は0以上を入力してください')
    .max(1, '税率は1以下を入力してください')
    .transform(val => new Prisma.Decimal(val)),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  amount: z.number().optional()
    .transform(val => val ? new Prisma.Decimal(val) : undefined),
  category: z.enum(['GOODS', 'SERVICE', 'IT_EQUIPMENT', 'SOFTWARE_LICENSE', 'CONSULTING', 'OTHER'])
    .optional()
}).refine(data => {
  // 軽減税率（8%）が適用される場合、説明が必須
  if (data.taxRate.equals(new Prisma.Decimal(0.08)) && !data.description) {
    return false
  }
  return true
}, {
  message: '軽減税率を適用する場合は、適用理由を説明に記入してください',
  path: ['description']
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
  vendorId: stringValidation.required,
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: 'ステータスは必須です',
    invalid_type_error: '無効なステータスです'
  }),
  orderDate: dateValidation.required,
  deliveryDate: dateValidation.required,
  items: arrayValidation.nonEmpty(enhancedItemSchema),
  notes: stringValidation.description,
  tags: z.array(tagSchema),
  department: z.enum(['GENERAL', 'MANAGEMENT', 'EXECUTIVE']).optional(),
  creditLimit: z.number().optional().transform(val => val ? new Prisma.Decimal(val) : undefined)
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
}).refine(data => {
  // 品目数の上限チェック
  return data.items.length <= MAX_ITEMS
}, {
  message: `品目数は${MAX_ITEMS}個以内にしてください`,
  path: ['items']
}).refine(data => {
  // 合計金額の上限チェック（部門別）
  const totalAmount = data.items.reduce((sum, item) => {
    const amount = item.quantity.mul(item.unitPrice)
    const tax = amount.mul(item.taxRate)
    return sum.add(amount).add(tax)
  }, new Prisma.Decimal(0))
  
  if (data.department) {
    return totalAmount.lessThan(DEPARTMENT_LIMITS[data.department])
  }
  return totalAmount.lessThan(DEPARTMENT_LIMITS.GENERAL) // デフォルトは一般部門の制限
}, {
  message: '発注総額が部門別の上限を超えています',
  path: ['items']
}).refine(data => {
  // 与信限度額チェック
  if (data.creditLimit) {
    const totalAmount = data.items.reduce((sum, item) => {
      const amount = item.quantity.mul(item.unitPrice)
      const tax = amount.mul(item.taxRate)
      return sum.add(amount).add(tax)
    }, new Prisma.Decimal(0))
    return totalAmount.lessThan(data.creditLimit)
  }
  return true
}, {
  message: '発注総額が取引先の与信限度額を超えています',
  path: ['items']
}).refine(data => {
  // 同一品目の重複チェック
  const itemNames = data.items.map(item => item.itemName)
  return new Set(itemNames).size === itemNames.length
}, {
  message: '同じ品目が複数登録されています',
  path: ['items']
}).refine(data => {
  // 税率の妥当性チェック（8%と10%のみ許可）
  return data.items.every(item => 
    item.taxRate.equals(new Prisma.Decimal(0.08)) || 
    item.taxRate.equals(new Prisma.Decimal(0.10))
  )
}, {
  message: '無効な税率が指定されています',
  path: ['items']
}).refine(data => {
  // 特定カテゴリーの承認要否チェック
  const requiresApproval = data.items.some(item => 
    item.category && CATEGORIES_REQUIRING_APPROVAL.includes(item.category as any)
  )
  if (requiresApproval && data.status === PurchaseOrderStatus.SENT) {
    return false
  }
  return true
}, {
  message: '特定カテゴリーの品目が含まれているため、承認が必要です',
  path: ['status']
})

/**
 * 発注書フォームデータの型定義
 */
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

/**
 * 発注書フォームの初期値
 */
export const defaultPurchaseOrderFormData: PurchaseOrderFormData = {
  status: PurchaseOrderStatus.DRAFT,
  orderDate: new Date(),
  deliveryDate: new Date(),
  items: [],
  notes: '',
  vendorId: '',
  tags: [],
  department: 'GENERAL'
} 