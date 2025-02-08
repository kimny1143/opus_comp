import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateInvoiceInput, UpdateInvoiceInput } from '@/types/invoice'

// 請求書一覧の取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId') || undefined
    const status = searchParams.get('status') as 'DRAFT' | 'APPROVED' | undefined

    const where = {
      ...(vendorId && { vendorId }),
      ...(status && { status })
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ invoices, total: invoices.length })
  } catch (error) {
    return NextResponse.json(
      { error: '請求書の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 請求書の新規作成
export async function POST(request: Request) {
  try {
    const body: CreateInvoiceInput = await request.json()

    // バリデーション
    if (!body.vendorId || !body.amount) {
      return NextResponse.json(
        { error: '取引先IDと金額は必須です' },
        { status: 400 }
      )
    }

    // 取引先の存在確認
    const vendor = await prisma.vendor.findUnique({
      where: { id: body.vendorId }
    })

    if (!vendor) {
      return NextResponse.json(
        { error: '指定された取引先が見つかりません' },
        { status: 404 }
      )
    }

    const invoice = await prisma.invoice.create({
      data: {
        vendorId: body.vendorId,
        totalAmount: body.amount,
        status: 'DRAFT',
        createdById: 'user-id' // TODO: 認証済みユーザーのIDを使用
      },
      include: {
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '請求書の作成に失敗しました' },
      { status: 500 }
    )
  }
}

// 請求書の更新
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: '請求書IDは必須です' },
        { status: 400 }
      )
    }

    const body: UpdateInvoiceInput = await request.json()

    // 請求書の存在確認
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // 承認済みの請求書は編集不可
    if (existingInvoice.status === 'APPROVED' && body.amount) {
      return NextResponse.json(
        { error: '承認済みの請求書は編集できません' },
        { status: 400 }
      )
    }

    const updateData = {
      ...(body.amount !== undefined && { totalAmount: body.amount }),
      ...(body.status !== undefined && { status: body.status })
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        vendor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    return NextResponse.json(
      { error: '請求書の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 請求書の削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: '請求書IDは必須です' },
        { status: 400 }
      )
    }

    // 請求書の存在確認
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // 承認済みの請求書は削除不可
    if (invoice.status === 'APPROVED') {
      return NextResponse.json(
        { error: '承認済みの請求書は削除できません' },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '請求書の削除に失敗しました' },
      { status: 500 }
    )
  }
}
