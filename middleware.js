import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// public routes (don't require authentication)
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/forgot-password',
  '/reset-password',
  '/verify-email'
];

//auth routes (redirect to dashboard if already logged in)
const authPaths = ['/login', '/register'];

// protected routes (require authentication)
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/contributions',
  '/admin',
  '/settings',
  '/payments',
  '/reports',
  '/chamas',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;
  
  // Check if user is authenticated
  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid tokens
      const response = NextResponse.next();
      response.cookies.delete('auth-token');
      response.cookies.delete('user');
    }
  }

  // Handle auth routes (login/register) - redirect if already logged in
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Handle public routes - allow access
  const isPublicPath = publicPaths.some(path => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  });
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Handle protected routes - require authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  if (isProtectedPath) {
    if (!isAuthenticated) {
      // Store the attempted URL to redirect back after login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // For any other routes not explicitly defined, treat as protected
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};
