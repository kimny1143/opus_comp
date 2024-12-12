import { NextResponse } from 'next/server'
import { ApiResponse, ApiErrorResponse } from '@/types/api'

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 })
  }
  
  return NextResponse.json({
    success: false,
    error: 'エラーが発生しました'
  }, { status: 500 })
}

export function createApiResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data
  })
} 