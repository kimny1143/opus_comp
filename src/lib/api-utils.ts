import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export type ApiErrorResponse = {
  error: string
  code?: string
  details?: unknown
}

export type ApiSuccessResponse<T> = {
  data: T
}

export function createErrorResponse(
  error: string,
  status: number = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error, code, details },
    { status }
  )
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    { data },
    { status }
  )
}

export function handlePrismaError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('Prisma error:', error)

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // 一意制約違反
    if (error.code === 'P2002') {
      return createErrorResponse(
        '既に存在するデータです',
        409,
        'UNIQUE_CONSTRAINT_VIOLATION'
      )
    }
    // 外部キー制約違反
    if (error.code === 'P2003') {
      return createErrorResponse(
        '関連するデータが見つかりません',
        400,
        'FOREIGN_KEY_CONSTRAINT_VIOLATION'
      )
    }
    // レコードが見つからない
    if (error.code === 'P2001') {
      return createErrorResponse(
        'データが見つかりません',
        404,
        'RECORD_NOT_FOUND'
      )
    }
  }

  // その他のエラー
  return createErrorResponse(
    'サーバーエラーが発生しました',
    500,
    'INTERNAL_SERVER_ERROR'
  )
}