import { Vendor as PrismaVendor, VendorCategory as PrismaVendorCategory, VendorStatus } from '@prisma/client'
import { Tag, TagFormData } from '@/types/tag'

export type AccountType = 'ORDINARY' | 'CURRENT'

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  ORDINARY: '普通',
  CURRENT: '当座'
} as const

export interface BankInfo {
  bankName: string
  branchName: string
  accountType: AccountType
  accountNumber: string
  accountHolder: string
}

export interface VendorBasic {
  id: string
  name: string
  code: string | null
}

export interface VendorWithRelations extends PrismaVendor {
  tags?: Tag[]
  bankInfo?: BankInfo | null
}

export interface ExtendedVendor extends Omit<VendorWithRelations, 'tags'> {
  bankInfo: BankInfo | null
  tags: TagFormData[]
}

export interface VendorListProps {
  vendors: VendorWithRelations[]
}

export type { VendorStatus, PrismaVendorCategory as VendorCategory }

export const VENDOR_CATEGORY_LABELS: Record<PrismaVendorCategory, string> = {
  CORPORATION: '法人',
  INDIVIDUAL: '個人'
} as const

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  ACTIVE: '有効',
  INACTIVE: '無効',
  BLOCKED: 'ブロック'
} as const

export interface Vendor {
  id: string
  category: PrismaVendorCategory
  name: string
  tradingName?: string
  code?: string
  registrationNumber?: string
  status: VendorStatus
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  bankInfo: BankInfo
  createdAt: Date
  updatedAt: Date
  createdById: string
  updatedById?: string
  tags?: Tag[]
} 