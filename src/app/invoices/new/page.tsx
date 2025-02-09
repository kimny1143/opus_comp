'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Vendor } from '@/types/vendor'

export default function NewInvoicePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taxIncluded, setTaxIncluded] = useState(true)

  // 取引先一覧の取得
  const fetchVendors = useCallback(async () => {
    try {
      const response = await fetch('/api/vendors', {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('取引先の取得に失敗しました')
      }
      const data = await response.json()
      setVendors(data.vendors || [])
    } catch (err) {
      setError('取引先の取得に失敗しました')
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchVendors()
    }
  }, [status, router, fetchVendors])

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
        credentials: 'include',
        body: JSON.stringify({
          vendorId,
          amount,
          taxIncluded
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

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  if (status === 'unauthenticated') {
    return null
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
            <Input
              type="number"
              name="amount"
              required
              min="0"
              step="1"
              className="pl-7"
              data-cy="amount-input"
            />
          </div>
        </div>

        {/* 内税/外税の選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            消費税の計算方式
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="taxType"
                checked={taxIncluded}
                onChange={() => setTaxIncluded(true)}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">内税(税込)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="taxType"
                checked={!taxIncluded}
                onChange={() => setTaxIncluded(false)}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">外税(税抜)</span>
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {taxIncluded 
              ? '※ 入力した金額から消費税額を計算します'
              : '※ 入力した金額に消費税を加算します'}
          </p>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-cy="submit-invoice-button"
          >
            {isLoading ? '作成中...' : '作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}