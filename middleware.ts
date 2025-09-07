import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  const access = req.cookies.get('accessToken')?.value;
  const role = req.cookies.get('role')?.value;
  if (!access || role !== 'admin') {
    const url = new URL('/admin/login', req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*'] };
