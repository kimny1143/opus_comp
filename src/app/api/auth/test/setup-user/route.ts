import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'
import { hashPassword } from '@/utils/auth/password'

const logger = createLogger('auth:test')

export async function POST() {
  try {
    // パスワードのハッシュ化
    const hashedPassword = await hashPassword('test-password')

    // テストユーザーの作成/更新
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        role: 'ADMIN',
        hashedPassword
      },
      create: {
        email: 'test@example.com',
        role: 'ADMIN',
        hashedPassword
      }
    })

    // ログ出力
    logger.info('テストユーザーを作成しました', {
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    logger.error('テストユーザーの作成に失敗しました', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Failed to setup test user' },
      { status: 500 }
    )
  }
}