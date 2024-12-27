import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // タグの処理
    const { tags, ...vendorData } = data
    
    const vendor = await prisma.vendor.create({
      data: {
        ...vendorData,
        createdById: session.user.id,
        tags: {
          create: tags?.map((tag: { name: string }) => ({
            name: tag.name,
          })) || [],
        },
      },
      include: {
        tags: true,
      },
    })

    return NextResponse.json({ 
      success: true, 
      data: vendor 
    })

  } catch (error) {
    if (error instanceof Error) {
      console.error('Vendor creation error:', {
          message: error.message,
          stack: error.stack,
          cause: error.cause
      })
    } else {
      console.error('Unknown vendor creation error:', error)
    }
    return NextResponse.json(
        { error: '取引先の作成に失敗しました' },
        { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ 
      success: true, 
      vendors 
    })

  } catch (error) {
    if (error instanceof Error) {
      console.error('Vendor fetch error:', {
          message: error.message,
          stack: error.stack,
          cause: error.cause
      })
    } else {
      console.error('Unknown vendor fetch error:', error)
    }
    return NextResponse.json(
      { error: '取引先の取得に失敗しました' },
      { status: 500 }
    )
  }
} 