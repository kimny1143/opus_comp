'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Vendor, VendorType } from '@/types/vendor'

export default function EditVendorPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [vendorType, setVendorType] = useState<VendorType>('CORPORATION')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchVendor()
    }
  }, [status, router])

  async function fetchVendor() {
    try {
      const res = await fetch(`/api/vendors/${params.id}`, {
        credentials: 'include' // セッションクッキーを送信
      })
      if (res.ok) {
        const data = await res.json()
        setVendor(data)
        setVendorType(data.type)
      } else {
        setError('取引先の取得に失敗しました')
      }
    } catch (error) {
      setError('エラーが発生しました')
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const vendorData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      address: formData.get('address') as string || null,
      type: vendorType,
      invoiceNumber: formData.get('invoiceNumber') as string || null,
      individualId: vendorType === 'INDIVIDUAL' ? (formData.get('individualId') as string || null) : null,
      corporateId: vendorType === 'CORPORATION' ? (formData.get('corporateId') as string || null) : null,
      firstTag: formData.get('firstTag') as string || null,
      secondTag: formData.get('secondTag') as string || null,
    }

    try {
      const res = await fetch(`/api/vendors/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // セッションクッキーを送信
        body: JSON.stringify(vendorData)
      })

      if (res.ok) {
        router.push('/vendors')
      } else {
        const data = await res.json()
        setError(data.error || '取引先の更新に失敗しました')
      }
    } catch (error) {
      setError('エラーが発生しました')
    }
  }

  if (status === 'loading' || !vendor) {
    return <div className="p-4">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">取引先の編集</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            取引先区分
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="CORPORATION"
                checked={vendorType === 'CORPORATION'}
                onChange={(e) => setVendorType('CORPORATION')}
                className="mr-2"
              />
              法人
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="INDIVIDUAL"
                checked={vendorType === 'INDIVIDUAL'}
                onChange={(e) => setVendorType('INDIVIDUAL')}
                className="mr-2"
              />
              個人
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            取引先名 *
          </label>
          <Input
            name="name"
            type="text"
            required
            defaultValue={vendor.name}
            placeholder="取引先名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス *
          </label>
          <Input
            name="email"
            type="email"
            required
            defaultValue={vendor.email}
            placeholder="example@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電話番号
          </label>
          <Input
            name="phone"
            type="tel"
            defaultValue={vendor.phone || ''}
            placeholder="03-1234-5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            住所
          </label>
          <Input
            name="address"
            type="text"
            defaultValue={vendor.address || ''}
            placeholder="東京都千代田区..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            インボイス番号
          </label>
          <Input
            name="invoiceNumber"
            type="text"
            defaultValue={vendor.invoiceNumber || ''}
            placeholder="T1234567890123"
            pattern="T\d{13}"
            title="T+13桁の数字"
          />
        </div>

        {vendorType === 'INDIVIDUAL' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              マイナンバー
            </label>
            <Input
              name="individualId"
              type="text"
              defaultValue={vendor.individualId || ''}
              placeholder="12桁の数字"
              pattern="\d{12}"
              title="12桁の数字"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              法人番号
            </label>
            <Input
              name="corporateId"
              type="text"
              defaultValue={vendor.corporateId || ''}
              placeholder="13桁の数字"
              pattern="\d{13}"
              title="13桁の数字"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タグ1
          </label>
          <Input
            name="firstTag"
            type="text"
            defaultValue={vendor.firstTag || ''}
            placeholder="タグ1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タグ2
          </label>
          <Input
            name="secondTag"
            type="text"
            defaultValue={vendor.secondTag || ''}
            placeholder="タグ2"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            キャンセル
          </Button>
          <Button type="submit">
            更新
          </Button>
        </div>
      </form>
    </div>
  )
}