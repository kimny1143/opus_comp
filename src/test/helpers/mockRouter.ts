import { vi } from 'vitest'
import { useRouter } from 'next/navigation'

// Next.jsのルーターをモック
export const mockRouter = () => {
  const push = vi.fn()
  const replace = vi.fn()
  const back = vi.fn()
  const forward = vi.fn()
  const refresh = vi.fn()
  const prefetch = vi.fn()

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    prefetch,
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
    isReady: true,
    isPreview: false,
  }
}

// useRouterフックをモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// ルーターのセットアップ
export const setupRouter = (options: Partial<ReturnType<typeof mockRouter>> = {}) => {
  const router = {
    ...mockRouter(),
    ...options,
  }
  ;(useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(router)
  return router
}

// ナビゲーション関数のモック
export const mockNavigation = () => {
  const router = setupRouter()
  return {
    // ページ遷移
    navigate: (path: string) => {
      router.push(path)
    },
    // ページ置換
    replace: (path: string) => {
      router.replace(path)
    },
    // 戻る
    goBack: () => {
      router.back()
    },
    // 進む
    goForward: () => {
      router.forward()
    },
    // 更新
    refresh: () => {
      router.refresh()
    },
    // プリフェッチ
    prefetch: (path: string) => {
      router.prefetch(path)
    },
  }
}

// ルーターのリセット
export const resetRouter = () => {
  const router = mockRouter()
  Object.keys(router).forEach((key) => {
    if (typeof router[key as keyof typeof router] === 'function') {
      ;(router[key as keyof typeof router] as ReturnType<typeof vi.fn>).mockReset()
    }
  })
  ;(useRouter as unknown as ReturnType<typeof vi.fn>).mockReset()
}

// ナビゲーションのアサーション
export const expectNavigation = {
  // 特定のパスへの遷移をアサート
  toPath: (router: ReturnType<typeof mockRouter>, path: string) => {
    expect(router.push).toHaveBeenCalledWith(path)
  },
  // 戻るボタンのクリックをアサート
  back: (router: ReturnType<typeof mockRouter>) => {
    expect(router.back).toHaveBeenCalled()
  },
  // 進むボタンのクリックをアサート
  forward: (router: ReturnType<typeof mockRouter>) => {
    expect(router.forward).toHaveBeenCalled()
  },
  // ページの更新をアサート
  refresh: (router: ReturnType<typeof mockRouter>) => {
    expect(router.refresh).toHaveBeenCalled()
  },
  // プリフェッチをアサート
  prefetch: (router: ReturnType<typeof mockRouter>, path: string) => {
    expect(router.prefetch).toHaveBeenCalledWith(path)
  },
} 