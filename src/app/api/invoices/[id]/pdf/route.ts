import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { IdRouteContext } from '@/app/api/route-types'
import { generateInvoicePDF } from '@/lib/pdf'
import { ExtendedInvoice, BankInfo } from '@/types/invoice'

export async function GET(request: NextRequest, context: IdRouteContext) {
  try {
    const { id } = context.params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: true,
        template: true,
        purchaseOrder: {
          include: {
            vendor: {
              select: {
                name: true,
                address: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    const defaultBankInfo: BankInfo = {
      bankName: '',
      branchName: '',
      accountType: 'ordinary',
      accountNumber: '',
      accountHolder: ''
    }

    const formattedInvoice: ExtendedInvoice = {
      ...invoice,
      bankInfo: invoice.bankInfo as BankInfo || defaultBankInfo,
      purchaseOrder: invoice.purchaseOrder ? {
        id: invoice.purchaseOrder.id,
        orderNumber: invoice.purchaseOrder.orderNumber,
        status: invoice.purchaseOrder.status,
        vendorId: invoice.purchaseOrder.vendorId,
        vendor: {
          name: invoice.purchaseOrder.vendor.name,
          address: invoice.purchaseOrder.vendor.address || ''
        }
      } : null,
      template: {
        ...invoice.template,
        bankInfo: invoice.template.bankInfo as BankInfo || defaultBankInfo
      }
    }

    const pdfBytes = await generateInvoicePDF(formattedInvoice)

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { success: false, error: 'PDFの生成に失敗しました' },
      { status: 500 }
    )
  }
} 