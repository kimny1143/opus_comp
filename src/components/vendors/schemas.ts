import { z } from 'zod'
import { VendorCategory, VendorStatus } from '@prisma/client'

// カテゴリーとステータスのラベル定義
export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  CORPORATION: '法人',
  INDIVIDUAL: '個人'
}

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  ACTIVE: '有効',
  INACTIVE: '無効',
  BLOCKED: 'ブロック'
}

// フィールドラベル定義
export const FIELD_LABELS = {
  category: '取引先区分',
  name: '取引先名',
  tradingName: '屋号',
  code: '取引先コード',
  registrationNumber: '登録番号',
  status: 'ステータス',
  contactPerson: '担当者',
  email: 'メールアドレス',
  phone: '電話番号',
  address: '住所',
  tags: 'タグ'
} as const

// バリデーションスキーマ
export const vendorSchema = z.object({
  category: z.nativeEnum(VendorCategory),
  name: z.string().min(1, {
    message: '取引先名は必須です',
  }),
  tradingName: z.string().optional(),
  code: z.string().optional(),
  registrationNumber: z.string().optional(),
  status: z.nativeEnum(VendorStatus),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string().optional()
  })).default([])
})

// 型定義のエクスポート
export type VendorFormData = z.infer<typeof vendorSchema>
export type VendorFieldLabels = typeof FIELD_LABELS 

export type Tag = {
  id: string
  name: string
  type?: string
} 