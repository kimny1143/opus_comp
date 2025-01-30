import { z } from 'zod';
import { commonValidation } from './commonValidation';

// インボイス登録番号のバリデーション
const invoiceRegistrationNumberSchema = z
  .string()
  .regex(/^T\d{13}$/, '正しい形式で入力してください（例：T1234567890123）');

// 税率の定義
export const TAX_RATES = {
  REDUCED: 0.08,  // 軽減税率
  STANDARD: 0.10  // 標準税率
} as const;

// 請求書ステータスの定義
export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE'
} as const;

// 請求書明細のスキーマ
export const invoiceItemSchema = z.object({
  itemName: z.string().min(1, '品目名は必須です'),
  quantity: z.number().min(1, '数量は1以上を入力してください'),
  unitPrice: z.number().min(0, '単価は0以上を入力してください'),
  taxRate: z.number().refine(
    (rate) => rate === TAX_RATES.REDUCED || rate === TAX_RATES.STANDARD,
    '不正な税率です'
  ),
  description: z.string().optional()
});

// 請求書のメインスキーマ
export const invoiceSchema = z.object({
  registrationNumber: invoiceRegistrationNumberSchema,
  vendorId: z.string().uuid(),
  status: z.enum(Object.values(INVOICE_STATUS) as [string, ...string[]]),
  issueDate: commonValidation.date.required,
  dueDate: commonValidation.date.required,
  items: z.array(invoiceItemSchema).min(1, '明細は1件以上必要です'),
  totalAmount: z.number().min(0),
  taxAmount: z.number().min(0),
  notes: z.string().optional(),
  bankInfo: z.object({
    bankName: z.string().min(1, '銀行名は必須です'),
    branchName: z.string().min(1, '支店名は必須です'),
    accountType: z.enum(['普通', '当座']),
    accountNumber: z.string().regex(/^\d{7}$/, '口座番号は7桁の数字で入力してください'),
    accountName: z.string().min(1, '口座名義は必須です')
  }),
  tags: z.array(z.string().uuid()).optional()
});

// フォーム用のスキーマ（一部のフィールドを省略可能に）
export const invoiceFormSchema = invoiceSchema.extend({
  status: z.enum(Object.values(INVOICE_STATUS) as [string, ...string[]]).optional(),
  totalAmount: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional()
});

export type InvoiceSchema = z.infer<typeof invoiceSchema>;
export type InvoiceFormSchema = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemSchema = z.infer<typeof invoiceItemSchema>; 