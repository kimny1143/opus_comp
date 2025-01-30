import { z } from 'zod'
import { VendorCategory, VendorStatus } from '@prisma/client'
import {
  commonSchemas,
  stringValidation,
  validationMessages
} from '@/types/validation/commonValidation'

export const vendorSchema = z.object({
  name: stringValidation.required,
  category: z.nativeEnum(VendorCategory, {
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
  }),
  status: z.nativeEnum(VendorStatus, {
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.invalidFormat
  }),
  email: stringValidation.email,
  phone: stringValidation.phone,
  address: stringValidation.required,
  bankInfo: commonSchemas.bankInfo,
  notes: stringValidation.optional,
  tags: z.array(commonSchemas.tag).default([])
})

export type VendorFormData = z.infer<typeof vendorSchema>

// カテゴリーの選択肢
export const VENDOR_CATEGORY_OPTIONS = [
  { value: VendorCategory.CORPORATION, label: '法人' },
  { value: VendorCategory.INDIVIDUAL, label: '個人' }
]

// ステータスの選択肢
export const VENDOR_STATUS_OPTIONS = [
  { value: VendorStatus.ACTIVE, label: '有効' },
  { value: VendorStatus.INACTIVE, label: '無効' },
  { value: VendorStatus.BLOCKED, label: 'ブロック' }
]

// フィールドラベル
export const FIELD_LABELS = {
  category: '取引先区分',
  name: '取引先名',
  tradingName: '屋号・商号',
  code: '取引先コード',
  registrationNumber: '登録番号',
  status: 'ステータス',
  contactPerson: '担当者名',
  email: 'メールアドレス',
  phone: '電話番号',
  address: '住所',
  tags: 'タグ'
} as const 