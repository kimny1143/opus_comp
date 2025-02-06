import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ViewApiSuccessResponse, ViewApiErrorResponse } from '@/types/view/payment'
import { ApiErrorCode, createApiError } from '@/types/base/api'
import { createSuccessResponse } from '@/utils/typeConverters'

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
      createApiError(
        ApiErrorCode.INVALID_INPUT,
        JSON.stringify(error.errors)
      ),
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      createApiError(
        ApiErrorCode.DATABASE_ERROR,
        JSON.stringify({ code: error.code, meta: error.meta })
      ),
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      createApiError(
        ApiErrorCode.VALIDATION_ERROR,
        errorMessage
      ),
      { status: 400 }
    )
  }

  return NextResponse.json(
    createApiError(
      ApiErrorCode.INTERNAL_ERROR,
      process.env.NODE_ENV === 'development' ? errorDetails : undefined
    ),
    { status: 500 }
  )
}