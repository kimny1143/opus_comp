import { prisma } from '@/lib/prisma'
import { PurchaseOrderDetailView } from '@/components/purchase-orders/PurchaseOrderDetailView'
import { notFound } from 'next/navigation'
import { PurchaseOrderStatus } from '@prisma/client'

interface Props {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function PurchaseOrderPage({ params }: Props) {
  const { id } = params

  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          code: true,
          email: true
        }
      },
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
    taxAmount: purchaseOrder.taxAmount.toNumber(),
    items: purchaseOrder.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      taxRate: item.taxRate.toNumber(),
      amount: item.amount.toNumber()
    })),
    statusHistory: purchaseOrder.statusHistory.map(history => ({
      id: history.id,
      status: history.status as PurchaseOrderStatus,
      createdAt: history.createdAt,
      userId: history.userId,
      user: {
        id: history.user.id,
        name: history.user.name
      }
    })),
    updatedBy: purchaseOrder.updatedBy || undefined
  }

  return <PurchaseOrderDetailView purchaseOrder={formattedPurchaseOrder} />
} 