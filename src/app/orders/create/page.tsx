import { Metadata } from 'next'
import { OrderForm } from '@/components/orders/OrderForm'

export const metadata: Metadata = {
  title: '発注作成 | OPUS',
  description: '新規発注を作成します',
}

export default function CreateOrderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">発注作成</h1>
      <OrderForm />
    </div>
  )
} 