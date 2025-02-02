import '@testing-library/jest-dom'
import { expect, vi, beforeEach, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Testing Libraryのマッチャーを拡張
expect.extend(matchers as any)

// テスト環境の設定
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key'

// コンソール出力の制御
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

// テスト中は特定のコンソール出力を抑制
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Redis connection error') ||
      args[0].includes('Failed to create session'))
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Redis connection warning')
  ) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

console.log = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Redis connected successfully')
  ) {
    return
  }
  originalConsoleLog.apply(console, args)
}

// グローバルのモック設定
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}))

// React Testing Libraryのセットアップ
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// グローバルのテストクリーンアップ
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// テスト終了時にコンソール出力を元に戻す
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})

// Testing Libraryのカスタムマッチャーの型定義
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): void;
    toHaveClass(className: string): void;
    toBeVisible(): void;
    toBeDisabled(): void;
    toHaveValue(value: string | number | string[]): void;
    toHaveAttribute(attr: string, value?: string): void;
    toHaveTextContent(text: string | RegExp): void;
    toHaveLength(length: number): void;
    toMatchObject(obj: any): void;
    toHaveBeenCalledTimes(times: number): void;
  }
}

// グローバルのexpectヘルパー
const customExpect = expect as typeof expect & {
  arrayContaining<T>(arr: T[]): T[];
  objectContaining<T>(obj: Record<string, T>): T;
}

global.expect = customExpect