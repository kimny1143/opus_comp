'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InvoiceWithVendor, InvoiceStatus } from '@/types/invoice'

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [invoice, setInvoice] = useState<InvoiceWithVendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taxIncluded, setTaxIncluded] = useState(true)
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('DRAFT')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchInvoice()
    }
  }, [status, router])

  // 請求書データの取得
  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('請求書の取得に失敗しました')
      
      const data = await response.json()
      setInvoice(data.data)
      setTaxIncluded(data.data.taxIncluded)
      setInvoiceStatus(data.data.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : '請求書の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // フォームの送信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)

    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          amount,
          taxIncluded,
          status: invoiceStatus
        }),
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

  if (status === 'loading' || isLoading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  if (status === 'unauthenticated') {
    return null
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
            <Input
              type="number"
              name="amount"
              required
              min="0"
              step="1"
              defaultValue={Number(invoice.totalAmount)}
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

        {/* ステータスの選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ステータス
          </label>
          <select
            value={invoiceStatus}
            onChange={(e) => setInvoiceStatus(e.target.value as InvoiceStatus)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="DRAFT">下書き</option>
            <option value="PENDING">承認待ち</option>
            <option value="APPROVED">承認済み</option>
            <option value="PAID">支払済み</option>
            <option value="OVERDUE">支払期限超過</option>
          </select>
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
            disabled={isSaving}
            data-cy="submit-invoice-button"
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  )
}