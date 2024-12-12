'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

interface InvoiceFormData {
  templateId: string
  purchaseOrderId: string
  items: {
    itemName: string
    quantity: number
    unitPrice: number
    taxRate: number
    description?: string
  }[]
}

export function InvoiceForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceFormData>()

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/invoices')
      } else {
        const errorData = await response.json()
        setError(errorData.error || '登録中にエラーが発生しました')
      }
    } catch (error) {
      setError('登録中にエラーが発生しました')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* テンプレート選択とフォーム要素を追加 */}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          保存
        </button>
      </div>
    </form>
  )
} 