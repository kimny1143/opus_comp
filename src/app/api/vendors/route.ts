import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { vendorSchema } from './validation'
import { validationMessages } from '@/lib/validations/messages'
import { VendorCategory, VendorStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: validationMessages.auth.required },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // バリデーション
    const validationResult = vendorSchema.safeParse(data)
    if (!validationResult.success) {
      console.error('バリデーションエラー:', validationResult.error)
      return NextResponse.json(
        { 
          error: validationMessages.validation.invalid,
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { tags = [], category, name, status = 'ACTIVE', ...vendorData } = validationResult.data

    const vendor = await prisma.vendor.create({
      data: {
        name,
        category: category as VendorCategory,
        status: status as VendorStatus,
        ...vendorData,
        createdBy: {
          connect: { id: session.user.id }
        },
        tags: {
          create: tags.map(tag => ({ name: tag.name }))
        }
      },
      include: {
        tags: true,
        createdBy: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: vendor 
    })

  } catch (error) {
    console.error('取引先作成エラー:', error)
    return NextResponse.json(
      { error: validationMessages.error.server },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        tags: true,
        createdBy: {
          select: { name: true }
        },
        updatedBy: {
          select: { name: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: vendors 
    })

  } catch (error) {
    console.error('取引先の取得に失敗しました:', error)
    return NextResponse.json(
      { error: validationMessages.error.server },
      { status: 500 }
    )
  }
} 