import { cookies } from 'next/headers'
import { decode } from 'next-auth/jwt'

export interface AuthUser {
  userId: string
  role: 'USER' | 'ADMIN'
}

/**
 * リクエストから認証済みユーザー情報を取得する
 * @returns 認証済みユーザー情報
 * @throws Error 認証情報が無効な場合
 */
export async function getAuthUser(): Promise<AuthUser> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    throw new Error('認証トークンがありません')
  }

  const decoded = await decode({
    token: token.value,
    secret: process.env.NEXTAUTH_SECRET || 'mvp-secret'
  }) as AuthUser | null

  if (!decoded || !decoded.userId || !decoded.role) {
    throw new Error('無効な認証トークンです')
  }

  return decoded
}

/**
 * 管理者権限を確認する
 * @param user 認証済みユーザー情報
 * @returns 管理者の場合true
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN'
}