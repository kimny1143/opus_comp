export type VendorType = 'INDIVIDUAL' | 'CORPORATION'

export interface Vendor {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  type: VendorType
  invoiceNumber?: string | null  // インボイス番号(T+13桁)
  individualId?: string | null   // マイナンバー(個人の場合)
  corporateId?: string | null    // 法人番号(法人の場合)
  firstTag?: string | null
  secondTag?: string | null
  createdAt: Date
  updatedAt: Date
  createdById: string
}

export interface CreateVendorInput {
  name: string
  email: string
  phone?: string
  address?: string
  type: VendorType
  invoiceNumber?: string
  individualId?: string
  corporateId?: string
  firstTag?: string
  secondTag?: string
}

export interface UpdateVendorInput {
  name?: string
  email?: string
  phone?: string | null
  address?: string | null
  type?: VendorType
  invoiceNumber?: string | null
  individualId?: string | null
  corporateId?: string | null
  firstTag?: string | null
  secondTag?: string | null
}