import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookies (prefix: codeforge)
  // Better Auth uses cookies like: codeforge.session_token
  const cookies = request.cookies.getAll();
  const hasSessionCookie = cookies.some(cookie => 
    cookie.name.startsWith('codeforge') && 
    (cookie.name.includes('session') || cookie.name.includes('token'))
  );

  // Redirect unauthenticated users to home
  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
