import { NextResponse } from 'next/server';

export function middleware(request) {
  const authCookie = request.cookies.get('cmt_auth');
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authCookie && authCookie.value === 'authenticated' && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
