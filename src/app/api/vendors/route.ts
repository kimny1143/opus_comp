import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateVendorInput, UpdateVendorInput, VendorSearchParams } from '@/types/vendor'
import type { Prisma } from '@prisma/client'

// 取引先一覧の取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const tag = searchParams.get('tag') || undefined

    let whereConditions: Prisma.VendorWhereInput[] = []

    // 検索クエリがある場合
    if (query) {
      whereConditions.push({
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      })
    }

    // タグ検索がある場合
    if (tag) {
      whereConditions.push({
        OR: [
          { firstTag: tag },
          { secondTag: tag }
        ]
      })
    }

    const where: Prisma.VendorWhereInput = whereConditions.length > 0
      ? { AND: whereConditions }
      : {}

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ vendors, total: vendors.length })
  } catch (error) {
    return NextResponse.json(
      { error: '取引先の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 取引先の新規作成
export async function POST(request: Request) {
  try {
    const body: CreateVendorInput = await request.json()

    // バリデーション
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: '名前とメールアドレスは必須です' },
        { status: 400 }
      )
    }

    // タグの数を制限(最大2つまで)
    if (body.tags && body.tags.length > 2) {
      return NextResponse.json(
        { error: 'タグは最大2つまでしか設定できません' },
        { status: 400 }
      )
    }

    const createData: Prisma.VendorCreateInput = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      address: body.address || null,
      firstTag: body.tags?.[0] || null,
      secondTag: body.tags?.[1] || null,
      createdBy: {
        connect: { id: 'user-id' } // TODO: 認証済みユーザーのIDを使用
      }
    }

    const vendor = await prisma.vendor.create({
      data: createData
    })

    return NextResponse.json({ vendor }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '取引先の作成に失敗しました' },
      { status: 500 }
    )
  }
}

// 取引先の更新
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: '取引先IDは必須です' },
        { status: 400 }
      )
    }

    const body: UpdateVendorInput = await request.json()

    // タグの数を制限(最大2つまで)
    if (body.tags && body.tags.length > 2) {
      return NextResponse.json(
        { error: 'タグは最大2つまでしか設定できません' },
        { status: 400 }
      )
    }

    const updateData: Prisma.VendorUpdateInput = {
      ...(body.name && { name: body.name }),
      ...(body.email && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.tags !== undefined && {
        firstTag: body.tags[0] || null,
        secondTag: body.tags[1] || null
      })
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ vendor })
  } catch (error) {
    return NextResponse.json(
      { error: '取引先の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// 取引先の削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: '取引先IDは必須です' },
        { status: 400 }
      )
    }

    await prisma.vendor.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '取引先の削除に失敗しました' },
      { status: 500 }
    )
  }
}