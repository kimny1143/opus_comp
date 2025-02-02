import { Vendor as PrismaVendor, VendorCategory, VendorStatus } from '@prisma/client'
import { TagFormData } from '@/types/tag'
import type { VendorFormData, VendorFormDataRHF } from '@/types/validation/vendor'
import { AccountType } from './bankAccount'

// 基本型定義
export type VendorStatusType = VendorStatus;
export type VendorCategoryType = VendorCategory;

// DBモデル用の型定義
export interface VendorContact {
  id?: string;
  vendorId?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
}

// フォーム用の型定義は validation/vendor から再エクスポート
export { type VendorFormData, type VendorFormDataRHF };

// API入力用の型定義
export interface VendorCreateInput {
  id?: string;
  name: string;
  code?: string;
  address?: string;
  contacts?: Array<{
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    department?: string;
  }>;
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;
  notes?: string;
  tags?: TagFormData[];
  registrationNumber?: string;
  status?: VendorStatusType;
  category?: VendorCategoryType;
  bankInfo?: {
    bankName: string;
    branchName: string;
    accountType: AccountType;
    accountNumber: string;
    accountHolder: string;
  };
}

// 拡張取引先型定義
export interface ExtendedVendor extends PrismaVendor {
  contacts: VendorContact[];
  tags: TagFormData[];
}

// シリアライズ用の型定義
export type SerializedVendor = Omit<ExtendedVendor, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
}

export type VendorWithContacts = ExtendedVendor;

// ステータス定義
export const VendorStatusDefinition = {
  ACTIVE: '取引中',
  INACTIVE: '取引停止',
  PENDING: '審査中',
  REJECTED: '却下'
} as const;

// カテゴリー定義
export const VendorCategoryDefinition = {
  SUPPLIER: '仕入先',
  CONTRACTOR: '外注先',
  OTHER: 'その他'
} as const;

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.ORDINARY]: '普通',
  [AccountType.CURRENT]: '当座',
  [AccountType.SAVINGS]: '貯蓄'
} as const 