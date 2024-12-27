import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { sendEmail } from '@/lib/mail'
import { z } from 'zod'
import { Prisma, InvoiceStatus, InvoiceItem } from '@prisma/client'
import { RouteHandler } from '@/app/api/route-types'
import { BankInfo } from '@/types/invoice'

// インターフェースを定義
interface InvoiceItemData {
  itemName: string
  quantity: number
  unitPrice: number
  taxRate: number
  description?: string
}

// バリデーションスキーマ
const invoiceUploadSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  templateId: z.string().uuid(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  items: z.array(z.object({
    itemName: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    taxRate: z.number().min(0),
    description: z.string().optional()
  }))
})

export const POST: RouteHandler = async (request) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = invoiceUploadSchema.parse(body)

    // 発注データの取得と検証
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: validatedData.purchaseOrderId },
      include: { 
        vendor: true,
        items: true
      }
    })

    if (!purchaseOrder) {
      return NextResponse.json(
        { success: false, error: '対象の発注が見つかりません' },
        { status: 404 }
      )
    }

    // 発注のステータスチェック
    if (purchaseOrder.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: '納品確認が完了していない発注に対する請求書は登録できません' },
        { status: 400 }
      )
    }

    // 既存の請求書チェック
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        purchaseOrderId: validatedData.purchaseOrderId,
        status: { not: 'REJECTED' }
      }
    })

    if (existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'この発注に対する請求書は既に登録されています' },
        { status: 400 }
      )
    }

    // 請求書の金額と発注の金額を照合
    const invoiceTotal = validatedData.items.reduce((sum: number, item: InvoiceItemData) => {
      const subtotal = item.quantity * item.unitPrice
      const tax = subtotal * item.taxRate
      return sum + subtotal + tax
    }, 0)

    if (Math.abs(invoiceTotal - Number(purchaseOrder.totalAmount)) > 0.01) {
      return NextResponse.json(
        { success: false, error: '請求金額が発注金額と一致しません' },
        { status: 400 }
      )
    }

    // 請求書の作成
    const invoice = await prisma.invoice.create({
      data: {
        templateId: validatedData.templateId,
        purchaseOrderId: validatedData.purchaseOrderId,
        vendorId: purchaseOrder.vendorId,
        status: InvoiceStatus.REVIEWING,
        issueDate: new Date(validatedData.issueDate),
        dueDate: new Date(validatedData.dueDate),
        createdById: session.user.id,
        totalAmount: new Prisma.Decimal(invoiceTotal),
        invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
        bankInfo: {},
        notes: '',
        items: {
          create: validatedData.items.map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            taxRate: new Prisma.Decimal(item.taxRate),
            description: item.description
          }))
        }
      },
      include: {
        items: true,
        vendor: true,
        purchaseOrder: true,
        template: true
      }
    })

    // 請求書番号を更新（IDを使用）
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        invoiceNumber: `INV-${invoice.id.slice(0, 8).toUpperCase()}`
      },
      include: {
        items: true,
        vendor: true,
        purchaseOrder: true,
        template: true
      }
    })

    // 管理者へ通知
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
      if (admin.email) {
        await sendEmail(
          admin.email,
          'invoiceCreated',
          { 
            invoice: {
              ...updatedInvoice,
              bankInfo: updatedInvoice.bankInfo as BankInfo,
              template: {
                id: updatedInvoice.template.id,
                bankInfo: updatedInvoice.template.bankInfo as BankInfo,
                contractorName: updatedInvoice.template.contractorName,
                contractorAddress: updatedInvoice.template.contractorAddress,
                registrationNumber: updatedInvoice.template.registrationNumber,
                paymentTerms: updatedInvoice.template.paymentTerms
              }
            }
          }
        )
      }
    }

    return createApiResponse(updatedInvoice)
  } catch (error) {
    return handleApiError(error)
  }
} 