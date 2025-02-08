'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Vendor } from '@/types/vendor'

export default function NewInvoicePage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 取引先一覧の取得
  useState(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors')
        const data = await response.json()
        setVendors(data.vendors)
      } catch (err) {
        setError('取引先の取得に失敗しました')
      }
    }

    fetchVendors()
  })

  // フォームの送信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const vendorId = formData.get('vendorId') as string
    const amount = parseFloat(formData.get('amount') as string)

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          amount
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '請求書の作成に失敗しました')
      }

      router.push('/invoices')
    } catch (err) {
      setError(err instanceof Error ? err.message : '請求書の作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">請求書の新規作成</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 取引先の選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            取引先 *
          </label>
          <select
            name="vendorId"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            data-cy="vendor-select"
          >
            <option value="">選択してください</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        {/* 金額 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            金額 *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">¥</span>
            </div>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="1"
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              data-cy="amount-input"
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            data-cy="submit-invoice-button"
          >
            {isLoading ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
    </div>
  )
}