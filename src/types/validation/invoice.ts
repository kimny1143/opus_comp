import { z } from 'zod'
import { InvoiceStatus } from '@prisma/client'
import { Prisma } from '@prisma/client'

/**
 * 品目のスキーマ
 */
export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, '品目名は必須です'),
  quantity: z.number().min(0, '数量は0以上である必要があります'),
  unitPrice: z.union([
    z.number(),
    z.string(),
    z.any().refine((val) => val instanceof Prisma.Decimal, {
      message: '単価は数値または文字列である必要があります'
    })
  ]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  taxRate: z.union([
    z.number(),
    z.string(),
    z.any().refine((val) => val instanceof Prisma.Decimal, {
      message: '税率は数値または文字列である必要があります'
    })
  ]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  description: z.string().optional()
}).required()

/**
 * 銀行情報のスキーマ
 */
export const bankInfoSchema = z.object({
  accountType: z.enum(['ORDINARY', 'CURRENT', 'SAVINGS']),
  bankName: z.string().min(1, '銀行名は必須です'),
  branchName: z.string().min(1, '支店名は必須です'),
  accountNumber: z.string().min(1, '口座番号は必須です'),
  accountHolder: z.string().min(1, '口座名義は必須です'),
})

/**
 * タグのスキーマ
 */
export const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'タグ名は必須です'),
})

/**
 * メインの請求書スキーマ
 */
export const invoiceSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
  issueDate: z.date(),
  dueDate: z.date(),
  items: z.array(invoiceItemSchema).min(1, '品目は1つ以上必要です'),
  bankInfo: bankInfoSchema,
  notes: z.string().optional(),
  vendorId: z.string().min(1, '取引先の選択は必須です'),
  purchaseOrderId: z.string().min(1, '発注書の選択は必須です'),
  tags: z.array(tagSchema).optional(),
  registrationNumber: z.string().regex(/^T\d{13}$/, '登録番号形式が不正です'),
  invoiceNumber: z.string().min(1, '請求書番号は必須です')
})

/**
 * 請求書の型定義
 */
export type InvoiceFormData = z.infer<typeof invoiceSchema>

/**
 * 請求書の初期値
 */
export const defaultInvoiceFormData: InvoiceFormData = {
  status: InvoiceStatus.DRAFT,
  issueDate: new Date(),
  dueDate: new Date(),
  items: [],
  bankInfo: {
    bankName: '',
    branchName: '',
    accountType: 'ORDINARY',
    accountNumber: '',
    accountHolder: ''
  },
  notes: '',
  vendorId: '',
  purchaseOrderId: '',
  tags: [],
  registrationNumber: '',
  invoiceNumber: ''
}

/**
 * React Hook Form 用に最適化した型
 */
export type InvoiceFormDataRHF = Omit<InvoiceFormData, 'items' | 'tags'> & {
  items: z.infer<typeof invoiceItemSchema>[];
  tags: z.infer<typeof tagSchema>[];
} 