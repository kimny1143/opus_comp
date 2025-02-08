import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decode } from 'next-auth/jwt'

// JWTペイロードの型定義
interface JWTPayload {
  userId: string
  role: 'USER' | 'ADMIN'
}

// ロールチェック関数
const checkRole = (
  decoded: JWTPayload | null,
  path: string
): boolean => {
  if (!decoded) return false
  
  // 管理者専用パスのチェック
  if (adminOnlyPaths.some(p => path.startsWith(p))) {
    return decoded.role === 'ADMIN'
  }
  
  return true
}

// パスの設定
const publicPaths = ['/login', '/api/auth/login']
const adminOnlyPaths = [
  '/admin',
  '/api/admin',
  '/settings'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 公開パスの場合はスキップ
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next()
  }

  // 認証トークンの確認
  const token = request.cookies.get('auth-token')

  if (!token) {
    // 認証トークンがない場合はログインページへリダイレクト
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // トークンの検証とデコード
    const decoded = await decode({
      token: token.value,
      secret: process.env.NEXTAUTH_SECRET || 'mvp-secret'
    }) as JWTPayload | null

    if (!decoded) {
      throw new Error('Invalid token')
    }

    // ロールチェック
    if (!checkRole(decoded, path)) {
      // 権限エラーの場合は403エラーページへリダイレクト
      if (request.headers.get('accept')?.includes('application/json')) {
        return NextResponse.json(
          { error: '権限がありません' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/403', request.url))
    }

    // リクエストを続行
    const response = NextResponse.next()
    
    // レスポンスヘッダーにユーザー情報を追加
    response.headers.set('X-User-Role', decoded.role)
    return response
  } catch (error) {
    // トークンが無効な場合はログインページへリダイレクト
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: [
    // 認証が必要なパスを指定
    '/dashboard/:path*',
    '/vendors/:path*',
    '/invoices/:path*',
    // 認証APIは除外
    '/((?!api/auth|_next/static|favicon.ico).*)',
  ],
}