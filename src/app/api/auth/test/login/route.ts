import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encode } from 'next-auth/jwt'

export async function POST() {
  try {
    // テストユーザーの作成/更新
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        role: 'ADMIN',
        hashedPassword: 'password123'
      },
      create: {
        email: 'test@example.com',
        role: 'ADMIN',
        hashedPassword: 'password123'
      }
    })

    // JWTトークンの生成
    const token = await encode({
      token: {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      secret: process.env.NEXTAUTH_SECRET || 'mvp-secret',
    })

    // レスポンスの作成
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

    // Cookieの設定
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}