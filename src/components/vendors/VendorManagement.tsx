import React from 'react'
import { VendorForm } from './VendorForm'
import { useRouter } from 'next/navigation'
import { ExtendedVendor } from '@/types/vendor'
import { VendorFormData } from './schemas/vendorSchema'

interface VendorManagementProps {
  initialData?: Partial<ExtendedVendor>
}

export function VendorManagement({ initialData }: VendorManagementProps) {
  const router = useRouter()

  const convertToFormData = (vendor?: Partial<ExtendedVendor>): Partial<VendorFormData> | undefined => {
    if (!vendor) return undefined
    
    return {
      category: vendor.category,
      status: vendor.status,
      bankInfo: vendor.bankInfo || undefined,
      tags: vendor.tags || [],
      name: vendor.name
    }
  }

  const handleSubmit = async (data: VendorFormData) => {
    // TODO: 取引先データの保存処理を実装
    console.log('Vendor data:', data)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">取引先管理</h1>
      <VendorForm
        initialData={convertToFormData(initialData)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
} 