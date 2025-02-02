'use client'

import React, { useState } from 'react'
import { VendorForm } from './VendorForm'
import { useRouter } from 'next/navigation'
import { ExtendedVendor, VendorCreateInput } from '@/types/vendor'
import { VendorFormData } from './schemas/vendorSchema'
import { useToast } from '@/components/ui/toast/use-toast'
import { TagFormData } from '@/types/tag'

interface VendorManagementProps {
  isNew?: boolean
  initialData?: Partial<ExtendedVendor>
}

export function VendorManagement({ isNew = false, initialData }: VendorManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const convertToFormData = (vendor?: Partial<ExtendedVendor>): Partial<VendorFormData> | undefined => {
    if (!vendor) return undefined
    
    const formData: Partial<VendorFormData> = {
      name: vendor.name,
      status: vendor.status,
      category: vendor.category,
      email: vendor.email || undefined,
      phone: vendor.phone || undefined,
      address: vendor.address || undefined,
      tags: vendor.tags?.map(tag => ({
        id: tag.id,
        name: tag.name
      })) || []
    }

    return formData
  }

  const handleSubmit = async (data: VendorFormData) => {
    try {
      setIsSubmitting(true)
      
      // 必須フィールドの存在を確認
      if (!data.name) {
        throw new Error('取引先名は必須です')
      }

      const vendorData: VendorCreateInput = {
        name: data.name, // 必須フィールドを明示的に指定
        status: data.status,
        category: data.category,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tags: data.tags?.map(tag => ({
          id: tag.id,
          name: tag.name
        })),
        ...(initialData?.id ? { id: initialData.id } : {})
      }

      const response = await fetch('/api/vendors', {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vendorData)
      })

      if (!response.ok) {
        throw new Error('取引先の保存に失敗しました')
      }

      toast({
        title: '成功',
        description: `取引先を${isNew ? '作成' : '更新'}しました`,
      })

      // 一覧ページにリダイレクト
      router.push('/vendors')
    } catch (error) {
      console.error('取引先保存エラー:', error)
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? '取引先登録' : '取引先編集'}
      </h1>
      <VendorForm
        initialData={convertToFormData(initialData)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
} 