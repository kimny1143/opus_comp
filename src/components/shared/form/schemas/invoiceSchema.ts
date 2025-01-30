import { z } from 'zod'
import { InvoiceStatus } from '@prisma/client'
import { 
  numberValidation,
  dateValidation,
  stringValidation,
  arrayValidation
} from '@/types/validation/commonValidation'
import { bankInfoSchema } from '@/types/validation/bankInfo'
import { itemSchema } from '@/types/validation/item'
import { tagSchema } from '@/types/validation/tag'

// 請求書ステータスのオプション
export const INVOICE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: '下書き' },
  { value: 'PENDING', label: '承認待ち' },
  { value: 'APPROVED', label: '承認済み' },
  { value: 'REJECTED', label: '却下' },
  { value: 'PAID', label: '支払済み' },
  { value: 'CANCELLED', label: 'キャンセル' }
] as const

/**
 * 請求書のバリデーションスキーマ
 */
export const invoiceSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
  issueDate: dateValidation.required,
  dueDate: dateValidation.required,
  items: arrayValidation.nonEmpty(itemSchema),
  bankInfo: bankInfoSchema,
  notes: stringValidation.description,
  vendorId: stringValidation.required,
  purchaseOrderId: stringValidation.required.optional(),
  tags: z.array(tagSchema),
  registrationNumber: stringValidation.registrationNumber
}).refine(
  (data) => {
    return data.dueDate >= data.issueDate
  },
  {
    message: '支払期限は発行日以降の日付を指定してください',
    path: ['dueDate']
  }
)

/**
 * 請求書フォームデータの型定義
 */
export type InvoiceFormData = z.infer<typeof invoiceSchema>

/**
 * 請求書フォームの初期値
 */
export const defaultInvoiceFormData: InvoiceFormData = {
  status: 'DRAFT',
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