import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Prisma } from '@prisma/client'
import InvoiceManagement from '@/components/invoice/InvoiceManagement'

interface Props {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function InvoicePage({ params, searchParams }: Props) {
  const isNew = !params.id || params.id === 'new'
  const purchaseOrderId = searchParams.purchaseOrderId as string | undefined

  let invoice = null
  let purchaseOrder = null

  if (isNew) {
    if (purchaseOrderId) {
      purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: {
          vendor: true,
          items: true
        }
      })

      if (!purchaseOrder) {
        return notFound()
      }
    }
  } else {
    invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        vendor: true,
        purchaseOrder: {
          include: {
            items: true,
            vendor: true
          }
        }
      }
    })

    if (!invoice) {
      return notFound()
    }

    // 数値データを適切な型に変換
    invoice = {
      ...invoice,
      items: invoice.items.map(item => ({
        ...item,
        unitPrice: new Prisma.Decimal(item.unitPrice.toString()),
        taxRate: new Prisma.Decimal(item.taxRate.toString())
      })),
      totalAmount: new Prisma.Decimal(invoice.totalAmount.toString()),
      bankInfo: typeof invoice.bankInfo === 'string'
        ? JSON.parse(invoice.bankInfo)
        : invoice.bankInfo
    }
  }

  return (
    <div className="container mx-auto py-8">
      <InvoiceManagement
        isNew={isNew}
        initialData={invoice || undefined}
        purchaseOrder={purchaseOrder || undefined}
      />
    </div>
  )
}
