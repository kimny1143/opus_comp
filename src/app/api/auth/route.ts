import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { session } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'メールアドレスまたはパスワードが正しくありません'
        },
        { status: 401 }
      )
    }

    // パスワードを検証
    const isValidPassword = await comparePassword(password, user.hashedPassword || '')
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'メールアドレスまたはパスワードが正しくありません'
        },
        { status: 401 }
      )
    }

    // セッションを作成
    const newSession = await session.create({
      userId: user.id,
      role: user.role
    })

    return NextResponse.json({
      success: true,
      sessionToken: newSession.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('認証エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: '認証に失敗しました'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'セッションIDが見つかりません'
        },
        { status: 400 }
      )
    }

    await session.destroy(sessionId)

    return NextResponse.json({
      success: true,
      message: 'ログアウトしました'
    })
  } catch (error) {
    console.error('ログアウトエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'ログアウトに失敗しました'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id')
    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: '認証が必要です'
        },
        { status: 401 }
      )
    }

    const currentSession = await session.get(sessionId)
    if (!currentSession) {
      return NextResponse.json(
        {
          success: false,
          error: '認証が必要です'
        },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: currentSession.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'ユーザーが見つかりません'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('セッション確認エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'セッションの確認に失敗しました'
      },
      { status: 500 }
    )
  }
} 