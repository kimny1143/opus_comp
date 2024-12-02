 // Start of Selection
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = await getToken({ req })

    if (req.nextUrl.pathname.startsWith('/auth/') && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/vendors/:path*',
    '/orders/:path*',
    '/invoices/:path*',
    '/auth/:path*'
  ]
}