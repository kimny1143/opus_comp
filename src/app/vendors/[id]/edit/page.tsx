'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Vendor, UpdateVendorInput } from '@/types/vendor'

export default function EditVendorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // 取引先データの取得
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await fetch(`/api/vendors?id=${params.id}`)
        if (!response.ok) throw new Error('取引先の取得に失敗しました')
        
        const data = await response.json()
        setVendor(data.vendor)
        // 既存のタグを設定
        const existingTags = [
          data.vendor.firstTag,
          data.vendor.secondTag
        ].filter((tag): tag is string => !!tag)
        setTags(existingTags)
      } catch (err) {
        setError(err instanceof Error ? err.message : '取引先の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVendor()
  }, [params.id])

  // タグの追加
  const handleAddTag = () => {
    if (!tagInput.trim()) return
    if (tags.length >= 2) {
      setError('タグは最大2つまでしか設定できません')
      return
    }
    setTags([...tags, tagInput.trim()])
    setTagInput('')
    setError(null)
  }

  // タグの削除
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
    setError(null)
  }

  // フォームの送信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const vendorData: UpdateVendorInput = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      tags
    }

    try {
      const response = await fetch(`/api/vendors?id=${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '取引先の更新に失敗しました')
      }

      router.push('/vendors')
    } catch (err) {
      setError(err instanceof Error ? err.message : '取引先の更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  if (!vendor) {
    return <div className="container mx-auto px-4 py-8">取引先が見つかりません</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">取引先の編集</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            取引先名 *
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={vendor.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            data-cy="vendor-name-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            メールアドレス *
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={vendor.email}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            data-cy="vendor-email-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            電話番号
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={vendor.phone || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            data-cy="vendor-phone-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            住所
          </label>
          <input
            type="text"
            name="address"
            defaultValue={vendor.address || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            data-cy="vendor-address-input"
          />
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            タグ (最大2つ)
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="タグを入力..."
              data-cy="vendor-tag-input"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              data-cy="add-tag-button"
            >
              追加
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="ml-1 text-indigo-600 hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            ))}
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
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            data-cy="submit-vendor-button"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}