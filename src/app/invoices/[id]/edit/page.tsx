'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Invoice } from '@/types/invoice'

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 請求書データの取得
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices?id=${params.id}`)
        if (!response.ok) throw new Error('請求書の取得に失敗しました')
        
        const data = await response.json()
        setInvoice(data.invoice)

        // 承認済みの請求書は編集不可
        if (data.invoice.status === 'APPROVED') {
          router.push('/invoices')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '請求書の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoice()
  }, [params.id, router])

  // フォームの送信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)

    try {
      const response = await fetch(`/api/invoices?id=${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '請求書の更新に失敗しました')
      }

      router.push('/invoices')
    } catch (err) {
      setError(err instanceof Error ? err.message : '請求書の更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  if (!invoice) {
    return <div className="container mx-auto px-4 py-8">請求書が見つかりません</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">請求書の編集</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 取引先情報(表示のみ) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            取引先
          </label>
          <div className="mt-1 p-3 bg-gray-50 rounded-md">
            <p className="font-medium">{invoice.vendor.name}</p>
            <p className="text-gray-600">{invoice.vendor.email}</p>
          </div>
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
              defaultValue={invoice.totalAmount}
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
            disabled={isSaving}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            data-cy="submit-invoice-button"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}