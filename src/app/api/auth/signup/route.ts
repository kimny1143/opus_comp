import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signUpSchema } from '@/types/validation/authSchema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // バリデーション
    const result = signUpSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.errors[0].message,
          errors: result.error.errors
        },
        { status: 400 }
      )
    }

    const { email, password, confirmPassword } = result.data

    // パスワード一致の確認
    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'パスワードが一致しません',
          field: 'confirmPassword'
        },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'このメールアドレスは既に登録されています',
          field: 'email'
        },
        { status: 400 }
      )
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザーの作成（ロールを追加）
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        role: 'ADMIN', // デフォルトのロールを設定
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'ユーザーが作成されました',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }, { status: 201 })
  } catch (error) {
    console.error('ユーザー登録エラー:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'ユーザー登録中にエラーが発生しました',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
} 