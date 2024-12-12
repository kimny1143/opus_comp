'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Vendor } from '@prisma/client'

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface VendorResponse {
  vendor: Vendor
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  MANUFACTURER: '製造業',
  WHOLESALER: '卸売業',
  RETAILER: '小売業',
  SERVICE_PROVIDER: 'サービス業',
  OTHER: 'その他'
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '有効',
  INACTIVE: '無効',
  BLOCKED: 'ブロック'
}

export default function VendorDetail() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchVendor()
    }
  }, [id])

  const fetchVendor = async () => {
    try {
      const res = await fetch(`/api/vendors/${id}`)
      if (!res.ok) throw new Error('取引先の取得に失敗しました')
      const response: ApiResponse<VendorResponse> = await res.json()
      setVendor(response.data.vendor)
    } catch (err) {
      setError('取引先の取得に失敗しました')
    }
  }

  const handleEdit = () => {
    router.push(`/vendors/${id}/edit`)
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (!vendor) {
    return <p>読み込み中...</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">取引先詳細</h1>
        <button
          onClick={handleEdit}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          編集
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">会社名</dt>
            <dd className="mt-1 text-lg text-gray-900">{vendor.name}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">取引先コード</dt>
            <dd className="mt-1 text-lg text-gray-900">{vendor.code}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">インボイス登録番号</dt>
            <dd className="mt-1 text-lg text-gray-900">{vendor.registrationNumber || '未登録'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">業種</dt>
            <dd className="mt-1 text-lg text-gray-900">
              {BUSINESS_TYPE_LABELS[vendor.businessType || ''] || vendor.businessType || '未設定'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">ステータス</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                  vendor.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : 
                  'bg-red-100 text-red-800'}`}>
                {STATUS_LABELS[vendor.status]}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">担当者名</dt>
            <dd className="mt-1 text-lg text-gray-900">{vendor.contactPerson || '未設定'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
            <dd className="mt-1 text-lg text-gray-900">{vendor.email || '未設定'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">電話番号</dt>
            <dd className="mt-1 text-lg text-gray-900">{vendor.phone || '未設定'}</dd>
          </div>

          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">住所</dt>
            <dd className="mt-1 text-lg text-gray-900">{vendor.address || '未設定'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
