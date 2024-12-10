import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { purchaseOrderId } = body

    const template = await prisma.invoiceTemplate.findUnique({
      where: { id: params.id },
      include: { items: true }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const invoice = await prisma.invoice.create({
      data: {
        templateId: template.id,
        purchaseOrderId,
        status: 'DRAFT',
        items: {
          create: template.items.map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            description: item.description,
            amount: item.quantity * Number(item.unitPrice) * (1 + Number(item.taxRate))
          }))
        }
      }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 