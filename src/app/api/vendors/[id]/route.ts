import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'
import { handleApiError, createApiResponse } from '@/lib/api-utils'

interface IdRouteContext {
  params: { id: string }
}

export const GET = async (
  request: NextRequest,
  context: IdRouteContext
) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: context.params.id },
      select: {
        id: true,
        name: true,
        tradingName: true,
        code: true,
        registrationNumber: true,
        status: true,
        contactPerson: true,
        email: true,
        phone: true,
        address: true,
        category: true,
        businessType: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: '取引先が見つかりません' },
        { status: 404 }
      )
    }

    return createApiResponse(vendor)
  } catch (error) {
    return handleApiError(error)
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