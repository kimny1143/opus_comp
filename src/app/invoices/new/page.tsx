import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'

export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">請求書の新規作成</h1>
      <InvoiceForm />
    </div>
  )
} 