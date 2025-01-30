'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { OrderItemsForm } from './OrderItemsForm'

interface OrderFormData {
  vendorId: string
  orderDate: string
  deliveryDate?: string
  description?: string
  terms?: string
  items: Array<{
    itemName: string
    quantity: number
    unitPrice: number
    taxRate: number
    description?: string
  }>
}

export function OrderForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<OrderFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true)
      // TODO: 発注データの保存処理を実装
      console.log('送信データ:', data)
    } catch (error) {
      console.error('エラー:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            取引先
            <select
              {...register('vendorId', { required: '取引先を選択してください' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              data-cy="vendor-select"
            >
              <option value="">選択してください</option>
              {/* TODO: 取引先一覧の表示 */}
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
              {...register('orderDate', { required: '発注日を入力してください' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              data-cy="order-date"
            />
          </label>
          {errors.orderDate && (
            <p className="mt-1 text-sm text-red-600">{errors.orderDate.message}</p>
          )}
        </div>
      </div>

      <OrderItemsForm />

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => window.history.back()}
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