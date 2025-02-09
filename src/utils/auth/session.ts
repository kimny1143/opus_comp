import { cookies } from 'next/headers'
import { decode } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'

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
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || !session?.user?.role) {
    throw new Error('認証情報がありません')
  }

  return {
    userId: session.user.id,
    role: session.user.role as 'USER' | 'ADMIN'
  }
}

/**
 * 管理者権限を確認する
 * @param user 認証済みユーザー情報
 * @returns 管理者の場合true
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN'
}