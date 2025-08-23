// middleware.js (in root directory)
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
  console.log('JWT_SECRET in middleware:', process.env.JWT_SECRET)
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/admin'];
  const authRoutes = ['/login', '/register'];
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If token exists, verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // If user is authenticated and trying to access auth pages, redirect to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Check role-based access for admin routes
      if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (error) {
      // Invalid token - redirect to login if accessing protected route
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        // Clear invalid token
        response.cookies.delete('auth-token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register'
  ]
};

