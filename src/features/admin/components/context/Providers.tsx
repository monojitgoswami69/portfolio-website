'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './ToastContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
