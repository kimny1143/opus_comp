'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { InvoiceCreateInput } from '@/types/invoice'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'

export default function NewInvoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialInvoice: Partial<InvoiceCreateInput> = {
    status: 'DRAFT',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
    items: []
  }

  const handleSubmit = async (invoice: InvoiceCreateInput) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      })

      if (!response.ok) {
        throw new Error('請求書の作成に失敗しました')
      }

      const data = await response.json()
      router.push(`/invoices/${data.id}`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      // エラー処理（例：トースト通知など）
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">新規請求書作成</h1>
      <InvoiceForm
        initialData={initialInvoice}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
} 