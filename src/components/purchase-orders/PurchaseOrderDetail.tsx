'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PurchaseOrder, Vendor, PurchaseOrderItem, StatusHistory, Prisma } from '@prisma/client'
import { ArrowLeft, Edit2, Send } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { ItemsTable } from './ItemsTable'
import { OrderSummary } from './OrderSummary'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type ExtendedPurchaseOrder = PurchaseOrder & {
  vendor: Vendor
  items: (PurchaseOrderItem & {
    unitPrice: Prisma.Decimal
    taxRate: Prisma.Decimal
    amount: Prisma.Decimal
  })[]
  statusHistory: (StatusHistory & {
    user: {
      id: string
      name: string | null
    }
  })[]
  taxAmount?: Prisma.Decimal
}

interface PurchaseOrderDetailProps {
  id: string
}

export function PurchaseOrderDetail({ id }: PurchaseOrderDetailProps) {
  const router = useRouter()
  const [order, setOrder] = useState<ExtendedPurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/purchase-orders/${id}`)
      if (!response.ok) throw new Error('発注の取得に失敗しました')
      const data = await response.json()
      
      const taxAmount = data.items.reduce(
        (sum: Prisma.Decimal, item: PurchaseOrderItem) => {
          const itemAmount = new Prisma.Decimal(item.quantity).mul(item.unitPrice)
          return sum.plus(itemAmount.mul(item.taxRate))
        },
        new Prisma.Decimal(0)
      )
      
      setOrder({ ...data, taxAmount })
    } catch (error) {
      setError(error instanceof Error ? error.message : '発注の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!order) return <div>発注が見つかりません</div>

  const taxAmount = order.taxAmount?.toNumber() ?? 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">発注詳細</h1>
          <div className="ml-auto space-x-4">
            <button
              onClick={() => router.push(`/purchase-orders/${id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              編集
            </button>
            {order.status === 'DRAFT' && (
              <button
                onClick={() => {/* 送信処理を実装 */}}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="w-4 h-4 mr-2" />
                送信
              </button>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-4">基本情報</h3>
              <dl className="grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">発注番号</dt>
                <dd className="text-sm text-gray-900">{order.orderNumber}</dd>
                <dt className="text-sm font-medium text-gray-500">発注日</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(order.orderDate), 'yyyy/MM/dd', { locale: ja })}
                </dd>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="text-sm text-gray-900">
                  <StatusBadge status={order.status} />
                </dd>
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">取引先情報</h3>
              <dl className="grid grid-cols-2 gap-4">
                <dt className="text-sm font-medium text-gray-500">取引先名</dt>
                <dd className="text-sm text-gray-900">{order.vendor.name}</dd>
                <dt className="text-sm font-medium text-gray-500">取引先コード</dt>
                <dd className="text-sm text-gray-900">{order.vendor.code}</dd>
                <dt className="text-sm font-medium text-gray-500">担当者</dt>
                <dd className="text-sm text-gray-900">{order.vendor.contactPerson || '-'}</dd>
              </dl>
            </div>
          </div>

          {/* 明細 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">明細</h3>
            <ItemsTable 
              items={order.items.map(item => ({
                ...item,
                unitPrice: item.unitPrice.toNumber(),
                taxRate: item.taxRate.toNumber(),
                amount: item.amount.toNumber()
              }))}
              editable={false}
            />
            <OrderSummary
              className="mt-4"
              subtotal={order.totalAmount.toNumber()}
              taxAmount={order.taxAmount?.toNumber() || 0}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 