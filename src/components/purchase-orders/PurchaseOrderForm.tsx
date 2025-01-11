'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { PurchaseOrderStatus } from '@prisma/client'
import type { Decimal } from '@prisma/client/runtime/library'
import { ItemsTable } from './ItemsTable'
import { OrderSummary } from './OrderSummary'
import { VendorBasic } from '@/types/vendor'
import { Button } from "@/components/ui/button"
import { calculateItemTax, TaxableItem } from '@/domains/invoice/tax'

interface FormData {
  vendorId: string
  orderDate: Date
  deliveryDate: Date | null
  description: string | null
  terms: string | null
  status?: PurchaseOrderStatus
  items: {
    id: string
    purchaseOrderId: string
    itemName: string
    description: string | null
    quantity: number
    unitPrice: number
    taxRate: number
    amount?: number
  }[]
}

interface Props {
  mode: 'create' | 'edit'
  id?: string
}

interface PurchaseOrderResponse {
  id: string
  orderNumber: string
  orderDate: string
  deliveryDate: string | null
  description: string | null
  terms: string | null
  status: PurchaseOrderStatus
  totalAmount: number
  taxAmount: number
  vendor: {
    id: string
    name: string
    code: string | null
  }
  items: {
    id: string
    purchaseOrderId: string
    itemName: string
    description: string | null
    quantity: number
    unitPrice: number
    taxRate: number
    amount: number
  }[]
  statusHistory: {
    id: string
    status: PurchaseOrderStatus
    createdAt: string
    user: {
      id: string
      name: string | null
    }
  }[]
  createdBy: {
    id: string
    name: string | null
  }
  updatedBy?: {
    id: string
    name: string | null
  }
}

declare global {
  interface Window {
    __INITIAL_VENDORS__: VendorBasic[]
  }
}

export function PurchaseOrderForm({ mode, id }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [vendors, setVendors] = useState<VendorBasic[]>([])
  
  const [formData, setFormData] = useState<FormData>({
    vendorId: '',
    orderDate: new Date(),
    deliveryDate: null,
    description: null,
    terms: null,
    items: []
  })

  useEffect(() => {
    // vendorsの初期化
    const vendorsElement = document.getElementById('vendors-data')
    if (vendorsElement?.dataset.vendors) {
      try {
        const vendorsData = JSON.parse(vendorsElement.dataset.vendors)
        console.log('Loaded vendors:', vendorsData)
        setVendors(vendorsData)
      } catch (error) {
        console.error('Error parsing vendors data:', error)
      }
    }

    // 編集モードの場合、初期データを取得
    if (mode === 'edit' && id) {
      fetch(`/api/purchase-orders/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('発注データの取得に失敗しました')
          }
          return res.json() as Promise<PurchaseOrderResponse>
        })
        .then(data => {
          if (data) {
            setFormData({
              vendorId: data.vendor.id,
              orderDate: new Date(data.orderDate),
              deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
              description: data.description,
              terms: data.terms,
              items: data.items.map(item => ({
                id: item.id,
                purchaseOrderId: item.purchaseOrderId,
                itemName: item.itemName,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                amount: item.amount
              }))
            })
          }
        })
        .catch(err => {
          console.error('Error fetching purchase order:', err)
          setError('発注データの取得に失敗しました')
        })
    }
  }, [mode, id])

  // アイテムの金額計算用のヘルパー関数
  const calculateItemAmount = (item: FormData['items'][0]): number => {
    return item.amount || item.quantity * item.unitPrice
  }

  // 税額計算用のヘルパー関数
  const calculateTaxAmount = (items: FormData['items']): number => {
    return items.reduce((sum, item) => {
      const taxableItem: TaxableItem = {
        unitPrice: item.unitPrice.toString(),
        quantity: item.quantity,
        taxRate: item.taxRate
      };
      const { taxAmount } = calculateItemTax(taxableItem);
      return sum + taxAmount;
    }, 0);
  };

  // 小計計算用のヘルパー関数
  const calculateSubtotal = (items: FormData['items']): number => {
    return items.reduce((sum, item) => {
      return sum + calculateItemAmount(item)
    }, 0)
  }

  // 明細行の追加
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: '',
          purchaseOrderId: '',
          itemName: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 0.1,
          amount: 0
        }
      ]
    }))
  }

  // 明細行の削除
  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  // アイテムの更新
  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        // 数量または単価が変更された場合は金額を再計算
        amount: field === 'quantity' || field === 'unitPrice' 
          ? Number(value) * (field === 'quantity' ? newItems[index].unitPrice : newItems[index].quantity)
          : newItems[index].amount
      }
      return {
        ...prev,
        items: newItems
      }
    })
  }

  // 発注書の保存
  const handleSubmit = async (e: React.FormEvent, status?: PurchaseOrderStatus) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError('')

      console.log('Submitting with status:', status)

      const submitData = {
        vendorId: formData.vendorId,
        orderDate: formData.orderDate.toISOString(),
        deliveryDate: formData.deliveryDate ? formData.deliveryDate.toISOString() : null,
        description: formData.description,
        terms: formData.terms,
        status: status || PurchaseOrderStatus.DRAFT,
        totalAmount: calculateSubtotal(formData.items),
        taxAmount: calculateTaxAmount(formData.items),
        items: formData.items.map(item => ({
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          amount: item.amount || item.quantity * item.unitPrice
        }))
      }

      console.log('Submit data:', submitData)

      const response = await fetch(
        mode === 'create' 
          ? '/api/purchase-orders'
          : `/api/purchase-orders/${id}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '保存に失敗しました')
      }

      if (!result.success) {
        throw new Error(result.error || '保存に失敗しました')
      }

      // ステータス更新が成功した場合、一覧画面に戻る
      router.push('/purchase-orders')
      router.refresh()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // ステータス更新の処理
  const handleStatusUpdate = async (newStatus: PurchaseOrderStatus) => {
    if (!id) return

    try {
      setSaving(true)
      setError('')

      const response = await fetch(`/api/purchase-orders/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'ステータスの更新に失敗しました')
      }

      if (!result.success) {
        throw new Error(result.error || 'ステータスの更新に失敗しました')
      }

      // ステータス更新が成功した場合、一覧画面に戻る
      router.push('/purchase-orders')
      router.refresh()
    } catch (err) {
      console.error('Status update error:', err)
      setError(err instanceof Error ? err.message : 'ステータスの更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? '発注書作成' : '発注書編集'}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {/* 基本情報 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              取引先
            </label>
            <select
              value={formData.vendorId}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">選択してください</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              発注日
            </label>
            <input
              type="date"
              value={formData.orderDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, orderDate: new Date(e.target.value) }))}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              納期
            </label>
            <input
              type="date"
              value={formData.deliveryDate ? formData.deliveryDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                deliveryDate: e.target.value ? new Date(e.target.value) : null 
              }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* 明細 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">明細</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              <Plus className="w-4 h-4 mr-1" />
              明細を追加
            </button>
          </div>

          <ItemsTable
            items={formData.items}
            editable={true}
            onItemChange={handleItemChange}
            onItemRemove={handleRemoveItem}
          />

          <OrderSummary
            className="mt-4"
            subtotal={calculateSubtotal(formData.items)}
            taxAmount={calculateTaxAmount(formData.items)}
          />
        </div>

        {/* 備考・取引条件 */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              value={formData.description ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              取引条件
            </label>
            <textarea
              value={formData.terms ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, PurchaseOrderStatus.DRAFT)}
            disabled={saving}
            variant="outline"
          >
            下書きとして保存
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, PurchaseOrderStatus.SENT)}
            disabled={saving}
          >
            発注として登録
          </Button>
        </div>
      </div>
    </form>
  )
}