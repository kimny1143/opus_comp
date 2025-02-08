import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createLogger } from '@/lib/logger'

const logger = createLogger('test:setup')

export async function POST(request: Request) {
  // 開発環境またはテスト環境でのみ有効
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(
      JSON.stringify({ error: 'Not available in production' }),
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, password, role } = body

    // 既存のユーザーをチェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({
          message: 'User already exists',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role
          }
        }),
        { status: 409 }
      )
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        role
      }
    })

    logger.info('テストユーザーを作成', {
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }, { status: 201 })
  } catch (error) {
    logger.error('テストユーザー作成エラー', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}