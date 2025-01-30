import { z } from 'zod'
import { baseValidationRules } from './base'
import { itemSchema } from './item'
import { bankInfoSchema } from './bankInfo'
import { tagSchema } from './tag'
import { InvoiceStatus } from '@prisma/client'

/**
 * 請求書のバリデーションスキーマ
 */
export const invoiceSchema = z.object({
  id: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus, {
    errorMap: () => ({ message: 'ステータスを選択してください' })
  }).optional(),
  issueDate: baseValidationRules.pastDate,
  dueDate: baseValidationRules.requiredDate,
  items: baseValidationRules.nonEmptyArray(itemSchema),
  bankInfo: bankInfoSchema,
  notes: baseValidationRules.optionalString,
  vendorId: z.string().min(1, '取引先を選択してください'),
  tags: z.array(tagSchema).optional(),
  registrationNumber: z.string().min(1, '登録番号は必須です')
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
export const defaultInvoiceFormData: InvoiceFormData = {
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
  registrationNumber: ''
} 