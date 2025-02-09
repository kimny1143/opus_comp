import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { CreateVendorInput } from '@/types/vendor'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data: CreateVendorInput = await req.json()

    // 必須項目の検証
    if (!data.name || !data.email || !data.type) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    // インボイス番号の形式チェック
    if (data.invoiceNumber && !/^T\d{13}$/.test(data.invoiceNumber)) {
      return NextResponse.json(
        { error: 'インボイス番号の形式が不正です' },
        { status: 400 }
      )
    }

    // マイナンバーの形式チェック
    if (data.type === 'INDIVIDUAL' && data.individualId && !/^\d{12}$/.test(data.individualId)) {
      return NextResponse.json(
        { error: 'マイナンバーの形式が不正です' },
        { status: 400 }
      )
    }

    // 法人番号の形式チェック
    if (data.type === 'CORPORATION' && data.corporateId && !/^\d{13}$/.test(data.corporateId)) {
      return NextResponse.json(
        { error: '法人番号の形式が不正です' },
        { status: 400 }
      )
    }

    const vendor = await prisma.vendor.create({
      data: {
        ...data,
        createdById: session.user.id
      }
    })

    return NextResponse.json({ vendor }, { status: 201 })
  } catch (error) {
    console.error('取引先登録エラー:', error)
    return NextResponse.json(
      { error: '取引先の登録に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const vendors = await prisma.vendor.findMany({
      where: {
        createdById: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ vendors })
  } catch (error) {
    console.error('取引先一覧取得エラー:', error)
    return NextResponse.json(
      { error: '取引先一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}