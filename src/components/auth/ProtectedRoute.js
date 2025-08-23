// components/auth/ProtectedRoute.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return null;
  }

  return children;
}