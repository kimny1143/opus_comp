import { prisma } from '@/lib/prisma'
import { PurchaseOrderDetailView } from '@/components/purchase-orders/PurchaseOrderDetailView'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function PurchaseOrderPage({ params }: Props) {
  const { id } = await params

  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: true,
      statusHistory: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true
        }
      },
      updatedBy: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  if (!purchaseOrder) {
    notFound()
  }

  const formattedPurchaseOrder = {
    ...purchaseOrder,
    totalAmount: purchaseOrder.totalAmount.toNumber(),
    items: purchaseOrder.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      taxRate: item.taxRate.toNumber()
    })),
    updatedBy: purchaseOrder.updatedBy || undefined
  }

  return <PurchaseOrderDetailView purchaseOrder={formattedPurchaseOrder} />
} 