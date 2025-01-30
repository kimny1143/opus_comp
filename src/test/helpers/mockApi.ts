import { vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// レスポンスステータス
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// APIレスポンスの型
interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

// モックリクエストの作成
export const createMockRequest = (options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: unknown
}) => {
  const { method = 'GET', url = 'http://localhost:3000', headers = {}, body } = options
  return new NextRequest(url, {
    method,
    headers: new Headers(headers),
    ...(body && { body: JSON.stringify(body) }),
  })
}

// モックレスポンスの作成
export const createMockResponse = <T>(options: Partial<ApiResponse<T>> = {}): NextResponse => {
  const { data, error, status = HttpStatus.OK } = options
  return NextResponse.json({ data, error }, { status })
}

// APIハンドラーのモック
export const mockApiHandler = <T = unknown>(response: Partial<ApiResponse<T>> = {}) => {
  return vi.fn().mockImplementation(() => createMockResponse(response))
}

// APIエラーレスポンスの作成
export const createErrorResponse = (status: number, message: string) => {
  return createMockResponse({ status, error: message })
}

// APIリクエストのアサーション
export const expectApiRequest = {
  // メソッドの確認
  toHaveMethod: (request: NextRequest, method: string) => {
    expect(request.method).toBe(method)
  },

  // ヘッダーの確認
  toHaveHeader: (request: NextRequest, name: string, value: string) => {
    expect(request.headers.get(name)).toBe(value)
  },

  // ボディの確認
  toHaveBody: async (request: NextRequest, expected: unknown) => {
    const body = await request.json()
    expect(body).toEqual(expected)
  },

  // クエリパラメータの確認
  toHaveQuery: (request: NextRequest, name: string, value: string) => {
    const url = new URL(request.url)
    expect(url.searchParams.get(name)).toBe(value)
  },
}

// APIレスポンスのアサーション
export const expectApiResponse = {
  // 成功レスポンスの確認
  toBeSuccess: async (response: NextResponse) => {
    expect(response.status).toBe(HttpStatus.OK)
    const body = await response.json()
    expect(body.error).toBeUndefined()
  },

  // エラーレスポンスの確認
  toBeError: async (response: NextResponse, status: number, message?: string) => {
    expect(response.status).toBe(status)
    const body = await response.json()
    if (message) {
      expect(body.error).toBe(message)
    }
  },

  // レスポンスボディの確認
  toHaveData: async <T>(response: NextResponse, expected: T) => {
    const body = await response.json()
    expect(body.data).toEqual(expected)
  },
}

// APIエンドポイントのモック
export const mockApiEndpoint = {
  // GETリクエストのモック
  get: <T>(path: string, response: Partial<ApiResponse<T>> = {}) => {
    return vi.fn().mockImplementation(() => createMockResponse(response))
  },

  // POSTリクエストのモック
  post: <T>(path: string, response: Partial<ApiResponse<T>> = {}) => {
    return vi.fn().mockImplementation(() => createMockResponse(response))
  },

  // PUTリクエストのモック
  put: <T>(path: string, response: Partial<ApiResponse<T>> = {}) => {
    return vi.fn().mockImplementation(() => createMockResponse(response))
  },

  // DELETEリクエストのモック
  delete: <T>(path: string, response: Partial<ApiResponse<T>> = {}) => {
    return vi.fn().mockImplementation(() => createMockResponse(response))
  },
}

// APIクライアントのモック
export const mockApiClient = {
  // 成功レスポンスを返すモック
  success: <T>(data: T) => {
    return vi.fn().mockResolvedValue({ data, status: HttpStatus.OK })
  },

  // エラーレスポンスを返すモック
  error: (status: number, message: string) => {
    return vi.fn().mockRejectedValue({ response: { status, data: { error: message } } })
  },

  // ネットワークエラーを返すモック
  networkError: () => {
    return vi.fn().mockRejectedValue(new Error('Network Error'))
  },
} 