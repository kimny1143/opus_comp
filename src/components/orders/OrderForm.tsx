'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { OrderItemsForm } from './OrderItemsForm'
import { useToast } from '@/components/ui/toast/use-toast'
import { commonValidation } from '@/types/validation/commonValidation'

// バリデーションスキーマの定義
const orderSchema = z.object({
  vendorId: z.string().min(1, '取引先を選択してください'),
  orderDate: z.string().min(1, '発注日を入力してください'),
  deliveryDate: z.string().optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(commonValidation.schemas.item).min(1, '品目は1つ以上必要です')
})

export type OrderFormData = z.infer<typeof orderSchema>

interface Vendor {
  id: string
  name: string
}

export function OrderForm() {
  const { toast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [{
        itemName: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0.1,
        description: ''
      }]
    }
  })

  // 取引先データの取得
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors')
        if (!response.ok) {
          throw new Error('取引先データの取得に失敗しました')
        }
        const data = await response.json()
        setVendors(data)
      } catch (error) {
        console.error('取引先データ取得エラー:', error)
        toast({
          title: 'エラー',
          description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVendors()
  }, [toast])

  const onSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('発注の作成に失敗しました')
      }

      toast({
        title: '成功',
        description: '発注を作成しました',
      })

      // 成功時のリダイレクト
      window.location.href = '/orders'
    } catch (error) {
      console.error('発注作成エラー:', error)
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            取引先
            <select
              {...register('vendorId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              data-cy="vendor-select"
              disabled={isSubmitting}
            >
              <option value="">選択してください</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </label>
          {errors.vendorId && (
            <p className="mt-1 text-sm text-red-600">{errors.vendorId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            発注日
            <input
              type="date"
              {...register('orderDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              data-cy="order-date"
              disabled={isSubmitting}
            />
          </label>
          {errors.orderDate && (
            <p className="mt-1 text-sm text-red-600">{errors.orderDate.message}</p>
          )}
        </div>
      </div>

      <OrderItemsForm
        control={control}
        disabled={isSubmitting}
      />

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          data-cy="submit-order"
        >
          {isSubmitting ? '送信中...' : '発注を作成'}
        </button>
      </div>
    </form>
  )
} 