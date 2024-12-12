import { z } from 'zod'

export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type VendorCategory = 'CORPORATION' | 'INDIVIDUAL';

export const STATUS_LABELS: Record<VendorStatus, string> = {
  ACTIVE: '有効',
  INACTIVE: '無効',
  BLOCKED: 'ブロック'
};

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  CORPORATION: '法人',
  INDIVIDUAL: '個人'
};

// タグのスキーマ
const tagSchema = z.object({
  id: z.string().optional(), // 新規作成時はIDなし
  name: z.string().min(1, 'タグ名は必須です'),
});

export type Tag = z.infer<typeof tagSchema>;

// 共通のフィールド
const commonVendorFields = {
  registrationNumber: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
    .default('ACTIVE'),
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tags: z.array(tagSchema).optional().default([]),
};

// 法人スキーマ
export const corporationSchema = z.object({
  ...commonVendorFields,
  category: z.literal('CORPORATION'),
  name: z.string().min(1, '会社名は必須です'),
  code: z.string()
    .optional()
    .nullable()
    .transform(val => val || null),
  contactPerson: z.string().optional().nullable(),
}).passthrough();

// 個人スキーマ
export const individualSchema = z.object({
  ...commonVendorFields,
  category: z.literal('INDIVIDUAL'),
  name: z.string().min(1, '氏名は必須です'),
  tradingName: z.string().optional().nullable(),
  code: z.string()
    .optional()
    .nullable()
    .transform(val => val || null),
}).passthrough();

// 統合スキーマ
export const vendorSchema = z.discriminatedUnion('category', [
  corporationSchema,
  individualSchema,
]);

export type VendorFormData = z.infer<typeof vendorSchema>;
export type CorporationVendor = z.infer<typeof corporationSchema>;
export type IndividualVendor = z.infer<typeof individualSchema>;

// フィールドラベル定義
export const FIELD_LABELS: Record<VendorCategory, Record<string, string>> = {
  CORPORATION: {
    name: '会社名',
    code: '法人番号',
    registrationNumber: 'インボイス登録番号',
    status: 'ステータス',
    contactPerson: '担当者名',
    email: 'メールアドレス',
    phone: '電話番号',
    address: '住所',
    tags: 'タグ'
  },
  INDIVIDUAL: {
    name: '氏名',
    tradingName: '屋号',
    code: 'マイナンバー',
    registrationNumber: 'インボイス登録番号',
    status: 'ステータス',
    email: 'メールアドレス',
    phone: '電話番号',
    address: '住所',
    tags: 'タグ'
  }
};

// フォームのエラー型を定義
export type VendorFormErrors = {
  [K in keyof VendorFormData]?: {
    message: string;
    type?: string;
  };
};

// フォームのデフォルト値の型を修正
export type VendorFormDefaults = {
  category: VendorCategory;
  status: VendorStatus;
  tags?: Tag[];
  code?: string;
  name?: string;
  registrationNumber?: string;
  contactPerson?: string;
  tradingName?: string;
  email?: string;
  phone?: string;
  address?: string;
}; 