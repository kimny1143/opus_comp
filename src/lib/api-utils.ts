import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ViewApiResponse, ViewApiSuccessResponse, ViewApiErrorResponse } from '@/types/view/payment'
import { createSuccessResponse, createErrorResponse } from '@/utils/typeConverters'

/**
 * APIレスポンスを作成
 */
export function createApiResponse<T>(data: T): NextResponse<ViewApiSuccessResponse<T>> {
  return NextResponse.json(createSuccessResponse(data))
}

/**
 * エラーハンドリング
 */
export function handleApiError(error: unknown): NextResponse<ViewApiErrorResponse> {
  // エラーオブジェクトをより安全に処理
  const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'
  const errorDetails = error instanceof Error ? error.stack : String(error)

  // デバッグ用のログ出力
  console.error('API Error:', {
    message: errorMessage,
    details: errorDetails
  })

  if (error instanceof ZodError) {
    return NextResponse.json(
      createErrorResponse('入力データが不正です', JSON.stringify(error.errors)),
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      createErrorResponse(
        'データベースエラーが発生しました',
        JSON.stringify({ code: error.code, meta: error.meta })
      ),
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      createErrorResponse('データの検証エラーが発生しました', errorMessage),
      { status: 400 }
    )
  }

  return NextResponse.json(
    createErrorResponse(
      'Internal server error',
      process.env.NODE_ENV === 'development' ? errorDetails : undefined
    ),
    { status: 500 }
  )
}