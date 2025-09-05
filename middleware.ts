// middleware.ts (raiz)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const adminPaths = ['/admin'];
const customerPaths = ['/cliente'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const access = req.cookies.get('accessToken')?.value;
  const role = req.cookies.get('role')?.value;

  // Admin
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (!access || role !== 'admin') {
      const url = new URL('/admin/login', req.url);
      return NextResponse.redirect(url);
    }
  }

  // Customer
  if (customerPaths.some((p) => pathname.startsWith(p))) {
    if (!access || role !== 'cliente') {
      const url = new URL('/login', req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/cliente/:path*',
  ],
};
