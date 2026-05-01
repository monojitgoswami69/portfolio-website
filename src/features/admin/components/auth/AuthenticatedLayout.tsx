'use client';

import { useAuth } from '@/features/admin/components/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  return <>{children}</>;
}
