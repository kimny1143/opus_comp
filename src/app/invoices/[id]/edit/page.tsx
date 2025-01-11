import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  // IDを非同期的に処理
  const { id } = params
  
  // DBから請求書情報を取得
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      vendor: true,
      purchaseOrder: true,
      template: true
    },
  })

  if (!invoice) {
    return notFound()
  }

  // Decimalデータをシリアライズ
  const serializedInvoice = {
    ...invoice,
    totalAmount: invoice.totalAmount.toString(),
    items: invoice.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
      taxRate: item.taxRate.toString(),
    })),
    purchaseOrder: invoice.purchaseOrder ? {
      ...invoice.purchaseOrder,
      totalAmount: invoice.purchaseOrder.totalAmount.toString(),
      taxAmount: invoice.purchaseOrder.taxAmount.toString(),
    } : null,
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">請求書の編集</h1>
      <InvoiceForm invoice={serializedInvoice} />
    </div>
  )
}