import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function EditPurchaseOrderPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  const { id } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <PurchaseOrderForm mode="edit" id={id} />
    </div>
  )
} 