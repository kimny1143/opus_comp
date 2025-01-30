import { vi } from 'vitest'
import { Session } from 'next-auth'
import { useSession, signIn, signOut } from 'next-auth/react'

// カスタムのUser型を定義
interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
}

// セッション型を拡張
interface CustomSession extends Session {
  user: User
}

// デフォルトのユーザーセッション
export const defaultSession: CustomSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
}

// セッションのモック
export const mockSession = (session: Partial<CustomSession> = {}) => {
  return {
    data: {
      ...defaultSession,
      ...session,
    },
    status: 'authenticated' as const,
    update: vi.fn(),
  }
}

// 未認証セッションのモック
export const mockUnauthenticatedSession = () => {
  return {
    data: null,
    status: 'unauthenticated' as const,
    update: vi.fn(),
  }
}

// ローディング中のセッションのモック
export const mockLoadingSession = () => {
  return {
    data: null,
    status: 'loading' as const,
    update: vi.fn(),
  }
}

// next-auth/reactのモック
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}))

// セッションのセットアップ
export const setupSession = (options: Partial<CustomSession> = {}) => {
  const session = mockSession(options)
  ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue(session)
  return session
}

// 未認証セッションのセットアップ
export const setupUnauthenticatedSession = () => {
  const session = mockUnauthenticatedSession()
  ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue(session)
  return session
}

// ローディング中セッションのセットアップ
export const setupLoadingSession = () => {
  const session = mockLoadingSession()
  ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue(session)
  return session
}

// サインイン関数のモック
export const mockSignIn = () => {
  return {
    execute: async (credentials?: { email: string; password: string }) => {
      return (signIn as unknown as ReturnType<typeof vi.fn>).mockImplementation(() =>
        Promise.resolve({ ok: true, error: null })
      )()
    },
    executeWithError: async (error: string) => {
      return (signIn as unknown as ReturnType<typeof vi.fn>).mockImplementation(() =>
        Promise.resolve({ ok: false, error })
      )()
    },
  }
}

// サインアウト関数のモック
export const mockSignOut = () => {
  return {
    execute: async () => {
      return (signOut as unknown as ReturnType<typeof vi.fn>).mockImplementation(() =>
        Promise.resolve({ ok: true })
      )()
    },
  }
}

// セッション関連のアサーション
export const expectSession = {
  // 認証済みであることをアサート
  toBeAuthenticated: (session: ReturnType<typeof mockSession>) => {
    expect(session.status).toBe('authenticated')
    expect(session.data).toBeTruthy()
  },
  // 未認証であることをアサート
  toBeUnauthenticated: (session: ReturnType<typeof mockUnauthenticatedSession>) => {
    expect(session.status).toBe('unauthenticated')
    expect(session.data).toBeNull()
  },
  // ローディング中であることをアサート
  toBeLoading: (session: ReturnType<typeof mockLoadingSession>) => {
    expect(session.status).toBe('loading')
    expect(session.data).toBeNull()
  },
  // サインインが呼ばれたことをアサート
  signInToBeCalled: (credentials?: { email: string; password: string }) => {
    if (credentials) {
      expect(signIn).toHaveBeenCalledWith('credentials', { ...credentials, redirect: false })
    } else {
      expect(signIn).toHaveBeenCalled()
    }
  },
  // サインアウトが呼ばれたことをアサート
  signOutToBeCalled: () => {
    expect(signOut).toHaveBeenCalled()
  },
} 