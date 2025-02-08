'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Vendor } from '@/types/vendor'

export default function VendorsPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 取引先一覧の取得
  async function fetchVendors(query?: string) {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('query', query)
      
      const response = await fetch(`/api/vendors?${params.toString()}`)
      const data = await response.json()
      setVendors(data.vendors)
    } catch (error) {
      console.error('取引先の取得に失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 取引先の削除
  async function handleDelete(id: string) {
    if (!confirm('この取引先を削除してもよろしいですか?')) {
      return
    }

    try {
      const response = await fetch(`/api/vendors?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchVendors(searchQuery)
      } else {
        console.error('取引先の削除に失敗しました')
      }
    } catch (error) {
      console.error('取引先の削除中にエラーが発生しました:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">取引先一覧</h1>
        <Link
          href="/vendors/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          data-cy="create-vendor-button"
        >
          新規登録
        </Link>
      </div>

      {/* 検索フォーム */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="取引先を検索..."
          className="w-full px-4 py-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchVendors(searchQuery)}
          data-cy="vendor-search-input"
        />
      </div>

      {/* 取引先一覧 */}
      {isLoading ? (
        <div className="text-center">読み込み中...</div>
      ) : (
        <div className="grid gap-4">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="border rounded p-4 flex justify-between items-center"
              data-cy="vendor-item"
            >
              <div>
                <h2 className="font-bold">{vendor.name}</h2>
                <p className="text-gray-600">{vendor.email}</p>
                {vendor.firstTag && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm mr-2">
                    {vendor.firstTag}
                  </span>
                )}
                {vendor.secondTag && (
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm">
                    {vendor.secondTag}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/vendors/${vendor.id}/edit`}
                  className="text-blue-500 hover:text-blue-700"
                  data-cy="edit-vendor-button"
                >
                  編集
                </Link>
                <button
                  onClick={() => handleDelete(vendor.id)}
                  className="text-red-500 hover:text-red-700"
                  data-cy="delete-vendor-button"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
          {vendors.length === 0 && (
            <div className="text-center text-gray-500">
              取引先が見つかりません
            </div>
          )}
        </div>
      )}
    </div>
  )
}