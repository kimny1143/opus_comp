import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decode } from 'next-auth/jwt'

// 認証が不要なパス
const publicPaths = ['/login', '/api/auth/login']

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
    // トークンの検証
    const decoded = await decode({
      token: token.value,
      secret: process.env.NEXTAUTH_SECRET || 'mvp-secret'
    })

    if (!decoded) {
      throw new Error('Invalid token')
    }

    // リクエストを続行
    return NextResponse.next()
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