'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Order {
  id: string
  orderNumber: string
  vendorName: string
  amount: number
  createdAt: string
}

export function RecentOrders() {
  const { data: orders } = useQuery<Order[]>({
    queryKey: ['recentOrders'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/recent-orders')
      if (!res.ok) throw new Error('注文履歴の取得に失敗しました')
      return res.json()
    }
  })

  return (
    <div className="space-y-4">
      {orders?.map(order => (
        <div key={order.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">{order.vendorName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">¥{order.amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(order.createdAt), 'MM/dd', { locale: ja })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 