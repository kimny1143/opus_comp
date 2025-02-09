import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id }
    })

    if (!vendor) {
      return NextResponse.json(
        { error: '取引先が見つかりません' },
        { status: 404 }
      )
    }

    if (vendor.createdById !== session.user.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      )
    }

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('取引先取得エラー:', error)
    return NextResponse.json(
      { error: '取引先の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id }
    })

    if (!vendor) {
      return NextResponse.json(
        { error: '取引先が見つかりません' },
        { status: 404 }
      )
    }

    if (vendor.createdById !== session.user.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      )
    }

    const data = await req.json()

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

    const updatedVendor = await prisma.vendor.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json(updatedVendor)
  } catch (error) {
    console.error('取引先更新エラー:', error)
    return NextResponse.json(
      { error: '取引先の更新に失敗しました' },
      { status: 500 }
    )
  }
}
