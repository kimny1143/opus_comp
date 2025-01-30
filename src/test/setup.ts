import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// テスト後のクリーンアップ
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetModules()
})

// ResizeObserverのモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// matchMediaのモック
global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

// Next.jsのルーティングモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
  }),
  usePathname: () => '/',
}))

// React PDFのモック
vi.mock('@react-pdf/renderer', () => ({
  Document: vi.fn(({ children }) => children),
  Page: vi.fn(({ children }) => children),
  Text: vi.fn(({ children }) => children),
  View: vi.fn(({ children }) => children),
  StyleSheet: {
    create: vi.fn(styles => styles),
  },
  pdf: vi.fn(() => ({
    toBlob: vi.fn().mockResolvedValue(new Blob()),
  })),
}))

// フェッチのモック
global.fetch = vi.fn()

// IntersectionObserverのモック
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// テスト環境の設定
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})

// エラーハンドリングの設定
const originalConsoleError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}

// 必要に応じて、他のグローバルなテストセットアップを追加 