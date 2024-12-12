'use client'

import { useQuery } from '@tanstack/react-query'
import { format, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Payment {
  id: string
  vendorName: string
  amount: number
  dueDate: string
}

export function PaymentCalendar() {
  const { data: payments } = useQuery<Payment[]>({
    queryKey: ['upcomingPayments'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/upcoming-payments')
      if (!res.ok) throw new Error('支払い予定の取得に失敗しました')
      return res.json()
    }
  })

  return (
    <div className="space-y-4">
      {payments?.map(payment => (
        <div key={payment.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{payment.vendorName}</p>
            <p className={cn(
              "text-xs",
              isToday(new Date(payment.dueDate)) 
                ? "text-red-500 font-medium" 
                : "text-muted-foreground"
            )}>
              {format(new Date(payment.dueDate), 'MM/dd (E)', { locale: ja })}
            </p>
          </div>
          <p className="text-sm font-medium">¥{payment.amount.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
} 