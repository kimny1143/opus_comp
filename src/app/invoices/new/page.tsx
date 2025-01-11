import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { serializeDecimal } from '@/lib/utils/decimal-serializer'

export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">新規請求書作成</h1>
      <InvoiceForm mode="create" />
    </div>
  )
} 