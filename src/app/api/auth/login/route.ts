import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encode } from 'next-auth/jwt'
import { comparePassword } from '@/utils/auth/password'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // 基本的なバリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      )
    }

    // ユーザーの検索
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
        role: true
      }
    })

    // ユーザーが存在しないまたはパスワードが一致しない場合
    if (!user || !(await comparePassword(password, user.hashedPassword))) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      )
    }

    // JWTトークンの生成(必要最小限の情報のみ含む)
    const token = await encode({
      token: {
        userId: user.id,
        role: user.role
      },
      secret: process.env.NEXTAUTH_SECRET || 'mvp-secret'
    })

    // レスポンスの作成
    const response = NextResponse.json({
      user: {
        role: user.role
      }
    })

    // Cookieの設定
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: '認証エラーが発生しました' },
      { status: 500 }
    )
  }
}