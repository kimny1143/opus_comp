import { vi } from 'vitest'
import '@testing-library/jest-dom'

// テスト環境の設定
// process.env.NODE_ENVは直接変更せず、vitestの環境変数を使用
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key'

// タイムアウトの設定(handover.mdのテスト戦略に基づいて調整)
vi.setConfig({
  testTimeout: 30000, // E2Eテストの実行時間目標(15分)を考慮して余裕を持たせる
})

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
  vi.clearAllMocks()
})

// テスト終了時にコンソール出力を元に戻す
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})