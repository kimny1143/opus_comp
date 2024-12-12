import { Vendor as PrismaVendor, VendorCategory, VendorStatus } from '@prisma/client'

export interface VendorBasic {
  id: string
  name: string
  code: string | null
}

export interface VendorWithRelations extends PrismaVendor {
  tags?: {
    id: string
    name: string
  }[]
}

export interface VendorListProps {
  vendors: VendorWithRelations[]
} 