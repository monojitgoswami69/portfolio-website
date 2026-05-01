'use client';

import { useToast } from '@/features/admin/components/context/ToastContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getStyles = (status: 'success' | 'error' | 'info') => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return '';
    }
  };

  const getIcon = (status: 'success' | 'error' | 'info') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border rounded-lg p-4 flex items-center gap-3 max-w-sm shadow-lg animate-in slide-in-from-top-2 fade-in-0 ${getStyles(
            toast.status
          )}`}
        >
          {getIcon(toast.status)}
          <div className="flex-1">
            {toast.action && <p className="font-semibold text-sm">{toast.action}</p>}
            <p className="text-sm">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
