import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PurchaseOrderDetail } from '@/components/purchase-orders/PurchaseOrderDetail'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function PurchaseOrderPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id: params.id }
  })

  if (!purchaseOrder) {
    redirect('/purchase-orders')
  }

  return <PurchaseOrderDetail id={params.id} />
} 