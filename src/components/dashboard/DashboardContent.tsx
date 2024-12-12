'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusSummary } from '@/components/dashboard/status-summary'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { PaymentCalendar } from '@/components/dashboard/payment-calendar'
import { AlertList } from '@/components/dashboard/alert-list'

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ダッシュボード</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>発注状況サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusSummary />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近の発注</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>支払い予定</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentCalendar />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>アラート・通知</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 