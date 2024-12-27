'use client'

import { PurchaseOrderStatus } from '@prisma/client'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ArrowLeft, Pencil, Check } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { ItemsTable } from './ItemsTable'
import { OrderSummary } from './OrderSummary'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  purchaseOrder: {
    id: string
    orderNumber: string
    orderDate: Date
    vendorId: string
    deliveryDate: Date | null
    status: PurchaseOrderStatus
    totalAmount: number
    createdAt: Date
    updatedAt: Date
    description: string | null
    terms: string | null
    vendor: {
      id: string
      name: string
      code: string | null
    }
    items: {
      id: string
      itemName: string
      description: string | null
      quantity: number
      unitPrice: number
      taxRate: number
    }[]
    statusHistory: {
      id: string
      status: PurchaseOrderStatus
      createdAt: Date
      userId: string
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
}

export function PurchaseOrderDetailView({ purchaseOrder }: Props) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const currentStatus = purchaseOrder.statusHistory[0]?.status || purchaseOrder.status

  const handleStatusUpdate = async (newStatus: PurchaseOrderStatus) => {
    if (isUpdating) return
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/purchase-orders/${purchaseOrder.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('ステータスの更新に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/purchase-orders"
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">発注書詳細</h1>
          </div>
          
          <div className="flex gap-2">
            {currentStatus === PurchaseOrderStatus.DRAFT && (
              <Link
                href={`/purchase-orders/${purchaseOrder.id}/edit`}
                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Pencil className="w-4 h-4 mr-1" />
                編集
              </Link>
            )}
            {currentStatus === PurchaseOrderStatus.SENT && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(PurchaseOrderStatus.COMPLETED)}
                disabled={isUpdating}
                className="flex items-center"
              >
                <Check className="w-4 h-4 mr-1" />
                納品完了
              </Button>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white shadow rounded-lg">
          {/* ステータスヘッダー */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">発注番号</p>
                <p className="text-lg font-medium">{purchaseOrder.orderNumber}</p>
              </div>
              <StatusBadge status={currentStatus} />
            </div>
          </div>

          {/* 基本情報 */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium mb-4">基本情報</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">取引先</p>
                <p className="mt-1">{purchaseOrder.vendor.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">発注日</p>
                <p className="mt-1">
                  {format(new Date(purchaseOrder.orderDate), 'yyyy年MM月dd日', { locale: ja })}
                </p>
              </div>
              {purchaseOrder.deliveryDate && (
                <div>
                  <p className="text-sm text-gray-500">納期</p>
                  <p className="mt-1">
                    {format(new Date(purchaseOrder.deliveryDate), 'yyyy年MM月dd日', { locale: ja })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 明細 */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium mb-4">明細</h3>
            <ItemsTable
              items={purchaseOrder.items}
              editable={false}
            />
            <OrderSummary
              className="mt-4"
              subtotal={purchaseOrder.totalAmount}
              taxAmount={0}
            />
          </div>

          {/* 備考・取引条件 */}
          {(purchaseOrder.description || purchaseOrder.terms) && (
            <div className="p-6 border-b">
              {purchaseOrder.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">備考</h3>
                  <p className="whitespace-pre-wrap">{purchaseOrder.description}</p>
                </div>
              )}
              {purchaseOrder.terms && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">取引条件</h3>
                  <p className="whitespace-pre-wrap">{purchaseOrder.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* メタ情報 */}
          <div className="p-6 text-sm text-gray-500">
            <div className="flex justify-between">
              <div>
                作成者: {purchaseOrder.createdBy.name}
                {' '}
                ({format(new Date(purchaseOrder.createdAt), 'yyyy/MM/dd HH:mm')})
              </div>
              {purchaseOrder.updatedBy && (
                <div>
                  最終更新: {purchaseOrder.updatedBy.name}
                  {' '}
                  ({format(new Date(purchaseOrder.updatedAt), 'yyyy/MM/dd HH:mm')})
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 