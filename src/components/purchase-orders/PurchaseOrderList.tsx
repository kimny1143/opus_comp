'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PurchaseOrderStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface PurchaseOrder {
  id: string
  orderNumber: string
  orderDate: Date
  deliveryDate: Date | null
  status: PurchaseOrderStatus
  totalAmount: number
  vendor: {
    id: string
    name: string
    code: string | null
  }
  items: {
    id: string
    itemName: string
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
}

interface Props {
  purchaseOrders: PurchaseOrder[]
}

export function PurchaseOrderList({ purchaseOrders }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">発注一覧</h1>
          <Link
            href="/purchase-orders/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            新規作成
          </Link>
        </div>

        {/* 一覧テーブル */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発注番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  取引先
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発注日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  納期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrders.map((order) => {
                const currentStatus = order.statusHistory[0]?.status || order.status
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/purchase-orders/${order.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.vendor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.orderDate), 'yyyy/MM/dd', { locale: ja })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.deliveryDate
                        ? format(new Date(order.deliveryDate), 'yyyy/MM/dd', { locale: ja })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={currentStatus} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 