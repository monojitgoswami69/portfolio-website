'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile Header */}
      <header className="lg:hidden h-14 bg-white border-b border-neutral-200 flex items-center px-4 sticky top-0 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-neutral-500 hover:text-neutral-700"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-bold text-neutral-900">Portfolio Manager</span>
      </header>

      {/* Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      <main className="lg:pl-64 min-h-screen flex flex-col">
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
