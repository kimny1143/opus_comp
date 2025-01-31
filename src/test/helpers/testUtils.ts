import { vi, expect, describe, it, beforeEach, afterEach, beforeAll, afterAll, Mock } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// HTTPステータスコードの定義
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * テストスイート用のユーティリティ
 */
export { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll }

/**
 * モック関連のユーティリティ
 */
export const mockFn = vi.fn
export const spyOn = vi.spyOn
export const mocked = vi.mocked

/**
 * APIハンドラーのモック用ユーティリティ
 */
export function createMockApiRequest(
  method: string,
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const req = new NextRequest(new URL('http://localhost:3000'), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: new Headers(headers),
  })
  return req
}

/**
 * レスポンスアサーション用ユーティリティ
 */
export async function assertApiResponse(
  response: NextResponse,
  expectedStatus: HttpStatus,
  expectedBody?: any
): Promise<void> {
  expect(response.status).toBe(expectedStatus)
  if (expectedBody) {
    const body = await response.json()
    expect(body).toEqual(expectedBody)
  }
}

/**
 * Prismaモック用ユーティリティ
 */
export function createMockPrisma() {
  return {
    $transaction: vi.fn((callback: () => any) => callback()),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  }
}

/**
 * セッションモック用ユーティリティ
 */
export function createMockSession(overrides?: Record<string, any>) {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'USER',
      ...overrides?.user,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  }
}

/**
 * 非同期テスト用ユーティリティ
 */
export async function waitFor(
  callback: () => void | Promise<void>,
  timeout = 5000
): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      await callback()
      return
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  await callback()
}

/**
 * エラーアサーション用ユーティリティ
 */
export function assertError(error: unknown, expectedMessage: string): void {
  expect(error).toBeInstanceOf(Error)
  expect((error as Error).message).toBe(expectedMessage)
}

// テスト用の型定義
export type MockFunction<T extends (...args: any[]) => any> = Mock<Parameters<T>, ReturnType<T>>