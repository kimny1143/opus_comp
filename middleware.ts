import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const url = req.nextUrl.clone();
  
  if (!token) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ロールに基づくアクセス制御
  if (url.pathname.startsWith('/admin') && token.role !== 'admin') {
    url.pathname = '/unauthorized';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
} 