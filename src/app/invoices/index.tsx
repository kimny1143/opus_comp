import { useState } from 'react'
import { Invoice } from '@/types/invoice'
import { InvoiceList } from '@/components/invoice/InvoiceList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { InvoiceStatus } from '@prisma/client'
import { InvoiceStatusDisplay } from '@/types/enums'

interface InvoicesPageProps {
  invoices: Invoice[]
}

export default function InvoicesPage({ invoices }: InvoicesPageProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました')
      }

      // 成功時の処理（例：リフレッシュなど）
    } catch (error) {
      console.error('Error updating status:', error)
      // エラー処理（例：トースト通知など）
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">請求書一覧</h1>
        <Link href="/invoices/new">
          <Button>新規作成</Button>
        </Link>
      </div>
      <InvoiceList
        invoices={invoices}
        onStatusChange={handleStatusChange}
        completedPurchaseOrders={[]}
      />
    </div>
  )
} 