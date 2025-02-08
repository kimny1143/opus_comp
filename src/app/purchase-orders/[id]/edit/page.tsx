import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PurchaseOrderFormDataWithRHF } from '@/components/purchase-orders/PurchaseOrderForm'
import { Prisma } from '@prisma/client'

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

  // 発注書データの取得
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: true,
      tags: true,
      statusHistory: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!purchaseOrder) {
    notFound()
  }

  // 取引先一覧の取得
  const vendors = await prisma.vendor.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      code: true
    },
    orderBy: {
      code: 'asc'
    }
  })

  // フォームの初期値を設定
  const initialData: Partial<PurchaseOrderFormDataWithRHF> = {
    vendorId: purchaseOrder.vendorId,
    status: purchaseOrder.status,
    orderDate: purchaseOrder.orderDate,
    deliveryDate: purchaseOrder.deliveryDate || undefined,
    items: purchaseOrder.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      quantity: new Prisma.Decimal(item.quantity),
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      description: item.description || '',
      category: 'GOODS', // デフォルト値を設定
      amount: item.amount
    })),
    notes: purchaseOrder.description || '',
    tags: purchaseOrder.tags.map(tag => ({
      id: tag.id,
      name: tag.name
    })),
    department: 'GENERAL' // デフォルト値を設定
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">発注書編集</h1>
      <PurchaseOrderForm 
        mode="edit" 
        id={id} 
        initialData={initialData}
        initialVendors={vendors.map(v => ({
          id: v.id,
          name: v.name,
          code: v.code || ''
        }))}
      />
    </div>
  )
}