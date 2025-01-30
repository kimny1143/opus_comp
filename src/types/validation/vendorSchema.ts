import { z } from 'zod'
import { commonValidation } from './commonValidation'
import { bankInfoSchema } from './bankInfo'
import { tagSchema } from './tag'

/**
 * 取引先カテゴリーの定義
 */
export const VENDOR_CATEGORY = {
  CORPORATION: 'CORPORATION',
  INDIVIDUAL: 'INDIVIDUAL',
  GOVERNMENT: 'GOVERNMENT',
  OTHER: 'OTHER'
} as const;

/**
 * 取引先ステータスの定義
 */
export const VENDOR_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED'
} as const;

/**
 * 取引先登録番号のバリデーション
 */
const vendorRegistrationNumberSchema = z
  .string()
  .regex(/^T\d{13}$/, '正しい形式で入力してください（例：T1234567890123）');

/**
 * 取引先のバリデーションスキーマ
 */
export const vendorSchema = z.object({
  name: z.string().min(1, '取引先名は必須です'),
  registrationNumber: vendorRegistrationNumberSchema,
  category: z.enum(Object.values(VENDOR_CATEGORY) as [string, ...string[]]),
  status: z.enum(Object.values(VENDOR_STATUS) as [string, ...string[]]),
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
  phone: z.string().regex(/^[0-9-]{10,}$/, '電話番号の形式が正しくありません').optional(),
  address: z.object({
    postalCode: z.string().regex(/^\d{3}-\d{4}$/, '郵便番号の形式が正しくありません'),
    prefecture: z.string().min(1, '都道府県は必須です'),
    city: z.string().min(1, '市区町村は必須です'),
    street: z.string().min(1, '番地は必須です'),
    building: z.string().optional()
  }),
  paymentTerms: z.object({
    method: z.enum(['銀行振込', '現金', 'その他']),
    dueDate: z.number().min(0).max(90, '支払期限は90日以内で設定してください'),
    notes: z.string().optional()
  }),
  tags: z.array(z.string().uuid()).optional(),
  notes: z.string().optional()
});

/**
 * 取引先フォームデータの型定義
 */
export type VendorFormData = z.infer<typeof vendorSchema>

/**
 * 取引先フォームの初期値
 */
export const defaultVendorFormData: VendorFormData = {
  name: '',
  email: '',
  phone: '',
  address: {
    postalCode: '',
    prefecture: '',
    city: '',
    street: '',
    building: ''
  },
  paymentTerms: {
    method: '銀行振込',
    dueDate: 0,
    notes: ''
  },
  notes: '',
  tags: [],
  registrationNumber: '',
  category: 'CORPORATION',
  status: 'ACTIVE'
}

/**
 * フォーム用のスキーマ（一部のフィールドを省略可能に）
 */
export const vendorFormSchema = vendorSchema.extend({
  status: z.enum(Object.values(VENDOR_STATUS) as [string, ...string[]]).optional(),
  address: vendorSchema.shape.address.partial(),
  paymentTerms: vendorSchema.shape.paymentTerms.partial()
});

export type VendorSchema = z.infer<typeof vendorSchema>;
export type VendorFormSchema = z.infer<typeof vendorFormSchema>; 