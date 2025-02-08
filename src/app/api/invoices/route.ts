import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateInvoiceInput, UpdateInvoiceInput } from '@/types/invoice'
import { getAuthUser, isAdmin } from '@/utils/auth/session'
import { generateInvoiceNumber } from '@/utils/invoice/generateInvoiceNumber'

// 請求書一覧の取得
export async function GET(request: Request) {
  try {
    // 認証済みユーザーの取得
    const authUser = await getAuthUser()

    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId') || undefined
    const status = searchParams.get('status') as 'DRAFT' | 'APPROVED' | undefined

    let whereConditions: any[] = []

    // 一般ユーザーは自分が作成した請求書のみ表示
    if (!isAdmin(authUser)) {
      whereConditions.push({
        createdById: authUser.userId
      })
    }

    // 取引先でのフィルタリング
    if (vendorId) {
      whereConditions.push({ vendorId })
    }

    // ステータスでのフィルタリング
    if (status) {
      whereConditions.push({ status })
    }

    const where = whereConditions.length > 0
      ? { AND: whereConditions }
      : {}

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        vendor: {
          select: {
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            email: true,
            role: true
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
    // 認証済みユーザーの取得
    const authUser = await getAuthUser()

    const body: CreateInvoiceInput = await request.json()

    // バリデーション
    if (!body.vendorId || !body.amount) {
      return NextResponse.json(
        { error: '取引先IDと金額は必須です' },
        { status: 400 }
      )
    }

    // 取引先の存在確認と権限チェック
    const vendor = await prisma.vendor.findUnique({
      where: { id: body.vendorId },
      include: {
        createdBy: {
          select: {
            id: true
          }
        }
      }
    })

    if (!vendor) {
      return NextResponse.json(
        { error: '指定された取引先が見つかりません' },
        { status: 404 }
      )
    }

    // 一般ユーザーは自分が作成した取引先のみ請求書を作成可能
    if (!isAdmin(authUser) && vendor.createdBy.id !== authUser.userId) {
      return NextResponse.json(
        { error: 'この取引先の請求書を作成する権限がありません' },
        { status: 403 }
      )
    }

    // 請求書番号の生成
    const invoiceNumber = generateInvoiceNumber()

    // 発行日と支払期限の設定
    const now = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30) // 支払期限は30日後

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        vendorId: body.vendorId,
        totalAmount: body.amount,
        status: 'DRAFT',
        issueDate: now,
        dueDate: dueDate,
        createdById: authUser.userId
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
    // 認証済みユーザーの取得
    const authUser = await getAuthUser()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: '請求書IDは必須です' },
        { status: 400 }
      )
    }

    const body: UpdateInvoiceInput = await request.json()

    // 請求書の存在確認と権限チェック
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            role: true
          }
        }
      }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // 作成者または管理者のみ編集可能
    if (existingInvoice.createdBy.id !== authUser.userId && !isAdmin(authUser)) {
      return NextResponse.json(
        { error: '編集権限がありません' },
        { status: 403 }
      )
    }

    // 承認済みの請求書は編集不可
    if (existingInvoice.status === 'APPROVED' && body.amount) {
      return NextResponse.json(
        { error: '承認済みの請求書は編集できません' },
        { status: 400 }
      )
    }

    // ステータスを承認に変更できるのは管理者のみ
    if (body.status === 'APPROVED' && !isAdmin(authUser)) {
      return NextResponse.json(
        { error: '請求書の承認は管理者のみ可能です' },
        { status: 403 }
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
        },
        createdBy: {
          select: {
            email: true,
            role: true
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
    // 認証済みユーザーの取得
    const authUser = await getAuthUser()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: '請求書IDは必須です' },
        { status: 400 }
      )
    }

    // 請求書の存在確認と権限チェック
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // 作成者または管理者のみ削除可能
    if (invoice.createdBy.id !== authUser.userId && !isAdmin(authUser)) {
      return NextResponse.json(
        { error: '削除権限がありません' },
        { status: 403 }
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
