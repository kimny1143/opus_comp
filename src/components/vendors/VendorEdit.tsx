'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Vendor, BusinessType, VendorStatus } from '@prisma/client'

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface VendorResponse {
  vendor: Vendor
}

const BUSINESS_TYPES = [
  { value: 'MANUFACTURER', label: '製造業' },
  { value: 'WHOLESALER', label: '卸売業' },
  { value: 'RETAILER', label: '小売業' },
  { value: 'SERVICE_PROVIDER', label: 'サービス業' },
  { value: 'OTHER', label: 'その他' }
] as const

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '有効' },
  { value: 'INACTIVE', label: '無効' },
  { value: 'BLOCKED', label: 'ブロック' }
] as const

export default function VendorEdit() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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
      setError('取引先取得に失敗しました')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!vendor) return

    try {
      setIsSaving(true)
      const res = await fetch(`/api/vendors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendor),
      })
      if (!res.ok) throw new Error('取引先の更新に失敗しました')

      router.push(`/vendors/${id}`)
    } catch (err) {
      setError('取引先の更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (!vendor) {
    return <p>読み込み中...</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">取引先編集</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">会社名</label>
            <input
              type="text"
              required
              value={vendor.name}
              onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">取引先コード</label>
            <input
              type="text"
              required
              value={vendor.code || ''}
              onChange={(e) => setVendor({ ...vendor, code: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">インボイス登録番号</label>
            <input
              type="text"
              value={vendor.registrationNumber || ''}
              onChange={(e) => setVendor({ ...vendor, registrationNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">業種</label>
            <select
              value={vendor.businessType || ''}
              onChange={(e) => setVendor({ ...vendor, businessType: e.target.value as BusinessType })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {BUSINESS_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ステータス</label>
            <select
              value={vendor.status}
              onChange={(e) => setVendor({ ...vendor, status: e.target.value as VendorStatus })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">担当者名</label>
            <input
              type="text"
              value={vendor.contactPerson || ''}
              onChange={(e) => setVendor({ ...vendor, contactPerson: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input
              type="email"
              value={vendor.email || ''}
              onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">電話番号</label>
            <input
              type="tel"
              value={vendor.phone || ''}
              onChange={(e) => setVendor({ ...vendor, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">住所</label>
            <textarea
              value={vendor.address || ''}
              onChange={(e) => setVendor({ ...vendor, address: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
} 