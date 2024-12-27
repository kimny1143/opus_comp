import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// バリデーションスキーマ
const templateItemSchema = z.object({
  itemName: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  taxRate: z.number().min(0),
  description: z.string().optional()
})

const templateSchema = z.object({
  name: z.string(),
  items: z.array(templateItemSchema)
})

// GET: テンプレート一覧の取得
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const templates = await prisma.invoiceTemplate.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        templateItems: true,
        _count: {
          select: { invoices: true }
        }
      }
    })

    return createApiResponse(templates)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST: テンプレートの作成
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = templateSchema.parse(body)

    const template = await prisma.invoiceTemplate.create({
      data: {
        name: validatedData.name,
        userId: session.user.id,
        contractorName: '',
        contractorAddress: '',
        registrationNumber: '',
        bankInfo: {
          bankName: '',
          branchName: '',
          accountType: 'ordinary',
          accountNumber: '',
          accountName: ''
        },
        paymentTerms: '',
        notes: '',
        templateItems: {
          create: validatedData.items.map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            taxRate: new Prisma.Decimal(item.taxRate),
            description: item.description || null
          }))
        }
      },
      include: {
        templateItems: true
      }
    })

    return createApiResponse(template)
  } catch (error) {
    return handleApiError(error)
  }
} 