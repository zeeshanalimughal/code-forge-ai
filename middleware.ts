import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow all API routes (including auth)
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookies
  // Better Auth creates cookies with the prefix we defined
  const cookies = request.cookies.getAll();
  
  // Check for session cookie - Better Auth uses format: {prefix}.session_token
  const hasSessionCookie = cookies.some(cookie => 
    cookie.name.includes('session') || 
    cookie.name.includes('token') ||
    cookie.name.startsWith('codeforge') ||
    cookie.name.startsWith('better-auth')
  );

  // Redirect unauthenticated users to home
  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
