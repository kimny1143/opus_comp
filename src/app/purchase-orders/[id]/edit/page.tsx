import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<Promise<{ id: string }> | { id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PurchaseOrderEditPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  const resolvedParams = await Promise.resolve(params)
  const { id } = resolvedParams

  return (
    <div className="container mx-auto px-4 py-8">
      <PurchaseOrderForm mode="edit" id={id} />
    </div>
  )
} 