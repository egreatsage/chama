'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      if (!isAuthenticated) {
        await checkAuth();
      }
      setIsChecking(false);
    };
    verify();
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isChecking && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, isChecking, router, allowedRoles]);

  if (isLoading || isChecking) {
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