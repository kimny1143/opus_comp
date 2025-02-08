'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Invoice } from '@/types/invoice'

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 請求書一覧の取得
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices')
        const data = await response.json()
        setInvoices(data.invoices)
      } catch (err) {
        setError('請求書の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  // 請求書の削除
  const handleDelete = async (id: string) => {
    if (!confirm('この請求書を削除してもよろしいですか?')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }

      // 一覧を更新
      setInvoices(invoices.filter(invoice => invoice.id !== id))
    } catch (err) {
      setError('請求書の削除に失敗しました')
    }
  }

  // ステータスの更新
  const handleStatusChange = async (id: string, newStatus: 'DRAFT' | 'APPROVED') => {
    try {
      const response = await fetch(`/api/invoices?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('更新に失敗しました')
      }

      // 一覧を更新
      const data = await response.json()
      setInvoices(invoices.map(invoice => 
        invoice.id === id ? data.invoice : invoice
      ))
    } catch (err) {
      setError('ステータスの更新に失敗しました')
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">請求書一覧</h1>
        <Link
          href="/invoices/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          data-cy="create-invoice-button"
        >
          新規作成
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="border rounded p-4 flex justify-between items-center"
            data-cy="invoice-item"
          >
            <div>
              <h2 className="font-bold">{invoice.vendor.name}</h2>
              <p className="text-gray-600">{invoice.vendor.email}</p>
              <p className="text-gray-600">¥{invoice.totalAmount.toLocaleString()}</p>
              <span
                className={`inline-block px-2 py-1 text-sm rounded ${
                  invoice.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {invoice.status === 'APPROVED' ? '承認済み' : '下書き'}
              </span>
            </div>
            <div className="flex space-x-2">
              {invoice.status === 'DRAFT' && (
                <>
                  <button
                    onClick={() => handleStatusChange(invoice.id, 'APPROVED')}
                    className="text-green-500 hover:text-green-700"
                    data-cy="approve-invoice-button"
                  >
                    承認
                  </button>
                  <Link
                    href={`/invoices/${invoice.id}/edit`}
                    className="text-blue-500 hover:text-blue-700"
                    data-cy="edit-invoice-button"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="text-red-500 hover:text-red-700"
                    data-cy="delete-invoice-button"
                  >
                    削除
                  </button>
                </>
              )}
              <button
                onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                className="text-gray-500 hover:text-gray-700"
                data-cy="download-pdf-button"
              >
                PDF
              </button>
            </div>
          </div>
        ))}
        {invoices.length === 0 && (
          <div className="text-center text-gray-500">
            請求書がありません
          </div>
        )}
      </div>
    </div>
  )
}
