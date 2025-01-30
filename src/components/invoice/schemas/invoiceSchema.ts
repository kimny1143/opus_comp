import { z } from 'zod'
import { InvoiceStatus } from '@prisma/client'
import { bankInfoSchema } from '@/types/bankAccount'
import { tagSchema } from '@/types/tag'

// 請求書項目のスキーマ
export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, '品目名は必須です'),
  description: z.string().optional().nullable(),
  quantity: z.number().min(1, '数量は1以上を入力してください'),
  unitPrice: z.number().min(0, '単価は0以上を入力してください'),
  taxRate: z.number().min(0, '税率は0以上である必要があります'),
  amount: z.number().optional()
})

// 請求書のスキーマ
export const invoiceSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
  issueDate: z.date(),
  dueDate: z.date(),
  items: z.array(z.object({
    id: z.string().optional(),
    itemName: z.string().min(1, '品目名は必須です'),
    quantity: z.number().min(1, '数量は1以上である必要があります'),
    unitPrice: z.number().min(0, '単価は0以上である必要があります'),
    taxRate: z.number().min(0.1, '消費税率は10%以上である必要があります'),
    description: z.string().optional()
  })),
  bankInfo: bankInfoSchema,
  notes: z.string().optional(),
  vendorId: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  registrationNumber: z.string().regex(/T\d{13}/, '適格請求書発行事業者の登録番号形式が不正です')
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
