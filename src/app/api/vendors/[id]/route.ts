import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const id = await context.params.id

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    })

    if (!vendor) {
      return NextResponse.json({ success: false, error: '取引先が見つかりません' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { vendor } })
  } catch (error) {
    console.error('Vendor fetch error:', error)
    return NextResponse.json({ success: false, error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params
  const data = await request.json()

  try {
    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, data: { vendor: updatedVendor } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: '取引先の更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const id = await context.params.id

  try {
    await prisma.vendor.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: '取引先の削除に失敗しました' }, { status: 500 })
  }
} 