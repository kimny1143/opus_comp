import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// APIレスポンスを作成
export function createApiResponse<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data })
}

// エラーハンドリング
export function handleApiError(error: unknown): NextResponse {
  // エラーオブジェクトをより安全に処理
  const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
  const errorDetails = error instanceof Error ? error.stack : null

  // デバッグ用のログ出力
  console.error('API Error:', {
    message: errorMessage,
    details: errorDetails,
    error
  })

  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        success: false, 
        error: '入力データが不正です', 
        details: error.errors 
      },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'データベースエラーが発生しました', 
        code: error.code,
        meta: error.meta
      },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'データの検証エラーが発生しました',
        details: errorMessage
      },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    },
    { status: 500 }
  )
} 