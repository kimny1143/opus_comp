import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
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
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    })

    return NextResponse.json({ message: 'ユーザーが作成されました' })
  } catch (error) {
    console.error('ユーザー登録エラー:', error)
    return NextResponse.json(
      { error: 'ユーザー登録中にエラーが発生しました' },
      { status: 500 }
    )
  }
} 