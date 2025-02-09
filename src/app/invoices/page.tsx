'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { InvoiceWithVendor, InvoiceStatus } from '@/types/invoice'

// ステータスの日本語表示
const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: '下書き',
  PENDING: '承認待ち',
  APPROVED: '承認済み',
  PAID: '支払済み',
  OVERDUE: '支払期限超過'
}

// ステータスに応じたスタイル
const statusStyles: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  PAID: 'bg-blue-100 text-blue-800',
  OVERDUE: 'bg-red-100 text-red-800'
}

export default function InvoicesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [invoices, setInvoices] = useState<InvoiceWithVendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchInvoices()
    }
  }, [status, router])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('請求書の取得に失敗しました')
      
      const data = await response.json()
      setInvoices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '請求書の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この請求書を削除してもよろしいですか?')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '請求書の削除に失敗しました')
      }

      // 請求書一覧を更新
      fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : '請求書の削除に失敗しました')
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">請求書一覧</h1>
        <Button
          onClick={() => router.push('/invoices/new')}
          data-cy="create-invoice-button"
        >
          新規作成
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                請求書番号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                取引先
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                発行日
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.vendor.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{Number(invoice.totalAmount).toLocaleString()}
                  <span className="text-xs text-gray-500 ml-1">
                    {invoice.taxIncluded ? '(税込)' : '(税抜)'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[invoice.status]}`}>
                    {statusLabels[invoice.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(invoice.issueDate).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                    onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                    data-cy="edit-invoice-button"
                  >
                    編集
                  </Button>
                  {invoice.status === 'DRAFT' && (
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(invoice.id)}
                      data-cy="delete-invoice-button"
                    >
                      削除
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="text-green-600 hover:text-green-900 ml-2"
                    onClick={() => router.push(`/invoices/${invoice.id}/preview`)}
                    data-cy="preview-pdf-button"
                  >
                    PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
