import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PurchaseOrderList } from '@/components/purchase-orders/PurchaseOrderList'

export default async function PurchaseOrdersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      items: true,
      statusHistory: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Decimal値を数値に変換
  const formattedPurchaseOrders = purchaseOrders.map(order => ({
    ...order,
    totalAmount: order.totalAmount.toNumber(),
    taxAmount: order.taxAmount?.toNumber() ?? 0,
    items: order.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      taxRate: item.taxRate.toNumber(),
      amount: item.amount?.toNumber() ?? 0
    }))
  }))

  return <PurchaseOrderList purchaseOrders={formattedPurchaseOrders} />
} 