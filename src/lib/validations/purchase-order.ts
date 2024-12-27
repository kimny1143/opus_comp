import { z } from 'zod'
import { PurchaseOrderStatus } from '@prisma/client'

const purchaseOrderItemSchema = z.object({
  itemName: z.string().min(1, '品目名は必須です'),
  quantity: z.number().min(1, '数量は1以上である必要があります'),
  unitPrice: z.number().min(0, '単価は0以上である必要があります'),
  taxRate: z.number().min(0).max(100, '税率は0-100%の範囲で指定してください'),
  description: z.string().optional(),
})

export const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, '取引先の選択は必須です'),
  orderNumber: z.string().optional(),
  orderDate: z.date(),
  deliveryDate: z.date().optional(),
  status: z.enum([
    PurchaseOrderStatus.DRAFT,
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.SENT,
    PurchaseOrderStatus.REJECTED,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.OVERDUE
  ]).default(PurchaseOrderStatus.DRAFT),
  items: z.array(purchaseOrderItemSchema).min(1, '少なくとも1つの品目が必要です'),
  notes: z.string().optional(),
})

export const bulkActionSchema = z.object({
  action: z.enum(['delete', 'updateStatus']),
  orderIds: z.array(z.string()).min(1, '発注書を選択してください'),
  status: z.enum([
    PurchaseOrderStatus.DRAFT,
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.SENT,
    PurchaseOrderStatus.REJECTED,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.OVERDUE
  ]).optional(),
})

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>
export type BulkActionInput = z.infer<typeof bulkActionSchema> 