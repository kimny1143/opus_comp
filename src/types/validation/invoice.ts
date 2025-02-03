import { z } from 'zod'
import { InvoiceStatus } from '@prisma/client'
import { Prisma } from '@prisma/client'

/**
 * 品目のスキーマ
 */
export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(1, '品目名は必須です'),
  quantity: z.number()
    .int('整数を入力してください')
    .min(1, '数量は0より大きい値を入力してください'),
  unitPrice: z.union([
    z.number()
      .int('整数を入力してください')
      .min(1, '単価は0以上を入力してください'),
    z.string(),
    z.any().refine((val) => val instanceof Prisma.Decimal, {
      message: '単価は数値または文字列である必要があります'
    })
  ]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  taxRate: z.union([
    z.number()
      .min(0.08, '税率は8%以上を入力してください')
      .max(0.1, '税率は10%以下を入力してください')
      .transform(val => Number(val.toFixed(2))), // 小数点以下2桁に丸める
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
  issueDate: z.date({
    required_error: '日付を入力してください',
    invalid_type_error: '日付を入力してください'
  }),
  dueDate: z.date(),
  items: z.array(invoiceItemSchema).min(1, '品目は1つ以上必要です'),
  bankInfo: bankInfoSchema,
  notes: z.string().optional(),
  vendorId: z.string().min(1, '取引先を選択してください'),
  purchaseOrderId: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  registrationNumber: z.string().regex(/^T\d{13}$/, '登録番号はTで始まる13桁の数字である必要があります'),
  invoiceNumber: z.string().optional(),
  allowExtendedTaxRates: z.boolean().optional()
}).refine(
  (data) => data.dueDate >= data.issueDate,
  {
    message: '支払期限は発行日以降の日付を指定してください',
    path: ['dueDate']
  }
)

/**
 * 請求書の型定義
 */
export type InvoiceFormData = z.infer<typeof invoiceSchema>

/**
 * 請求書の初期値
 */
export const defaultInvoiceFormData: Partial<InvoiceFormData> = {
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
  tags: [],
  allowExtendedTaxRates: false
}

/**
 * React Hook Form 用に最適化した型
 */
export type InvoiceFormDataRHF = Omit<InvoiceFormData, 'items' | 'tags'> & {
  items: z.infer<typeof invoiceItemSchema>[];
  tags: z.infer<typeof tagSchema>[];
}