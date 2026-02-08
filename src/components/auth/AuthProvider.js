'use client';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

export default function AuthProvider({ children }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasInitialized = useAuthStore((state) => state.hasInitialized);

  useEffect(() => {
    if (!hasInitialized) {
      checkAuth();
    }
  }, [checkAuth, hasInitialized]);

  if (!hasInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <SessionProvider>{children}</SessionProvider>;
}