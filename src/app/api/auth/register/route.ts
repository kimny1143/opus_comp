import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // 入力値の検証
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      )
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザーの作成
    await prisma.user.create({
      data: {
        email,
        hashedPassword,
        role: 'USER'
      }
    })

    return NextResponse.json(
      { message: '登録が完了しました' },
      { status: 201 }
    )
  } catch (error) {
    console.error('ユーザー登録エラー:', error)
    return NextResponse.json(
      { error: '登録に失敗しました' },
      { status: 500 }
    )
  }
}