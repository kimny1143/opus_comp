import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { RouteHandler, IdRouteContext } from '@/app/api/route-types'
import { z } from 'zod'
import { Prisma, InvoiceStatus } from '@prisma/client'

// バリデーションスキーマ
const createInvoiceSchema = z.object({
  vendorId: z.string().uuid(),
  purchaseOrderId: z.string().uuid(),
  issueDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional()
})

// POST: テンプレートから請求書を作成
export const POST = async (
  request: NextRequest,
  context: IdRouteContext
): Promise<NextResponse> => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createInvoiceSchema.parse(body)

    // テンプレートの取得
    const template = await prisma.invoiceTemplate.findUnique({
      where: { id: context.params.id },
      include: {
        templateItems: true
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'テンプレートが見つかりません' },
        { status: 404 }
      )
    }

    // 請求書の作成
    const invoice = await prisma.invoice.create({
      data: {
        templateId: template.id,
        vendorId: validatedData.vendorId,
        purchaseOrderId: validatedData.purchaseOrderId,
        status: InvoiceStatus.DRAFT,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        dueDate: validatedData.dueDate 
          ? new Date(validatedData.dueDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdById: session.user.id,
        invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
        bankInfo: template.bankInfo as Prisma.JsonObject,
        notes: '',
        // 合計金額を計算
        totalAmount: new Prisma.Decimal(
          template.templateItems.reduce((sum: number, item) => {
            const subtotal = Number(item.unitPrice) * item.quantity
            const tax = subtotal * Number(item.taxRate)
            return sum + subtotal + tax
          }, 0)
        ),
        items: {
          create: template.templateItems.map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            description: item.description || null
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

    return createApiResponse(invoice)
  } catch (error) {
    return handleApiError(error)
  }
} 