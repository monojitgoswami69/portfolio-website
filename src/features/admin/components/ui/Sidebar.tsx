'use client';

import React, { memo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/admin/components/context/AuthContext';
import { cn } from '@/lib/cn';
import {
  LayoutDashboard,
  LogOut,
  X,
  Folder,
  Mail,
  MessageSquare,
} from 'lucide-react';

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['superuser', 'admin', 'assistant']
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/admin/dashboard/projects',
    icon: Folder,
    roles: ['superuser', 'admin', 'assistant']
  },
  {
    id: 'contacts',
    label: 'Contacts',
    path: '/admin/dashboard/contacts',
    icon: Mail,
    roles: ['superuser', 'admin', 'assistant']
  },
  {
    id: 'communication',
    label: 'Communication',
    path: '/admin/dashboard/communication',
    icon: MessageSquare,
    roles: ['superuser', 'admin', 'assistant']
  }
];

type NavItem = (typeof navItems)[number];

const SidebarItem = memo(function SidebarItem({ 
    item, 
    onClick, 
    index = 0,
    isActive
}: { 
    item: NavItem; 
    onClick?: () => void; 
    index?: number;
    isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: index * 0.02 }}
    >
      <Link
        href={item.path}
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[44px] group relative overflow-hidden",
            "focus:outline-none",
            isActive
              ? "text-white sidebar-active-gradient shadow-md shadow-primary/20"
              : "text-neutral-500 hover:bg-gray-100 hover:text-neutral-900"
        )}
      >
        <div className="flex items-center gap-3 w-full relative z-10">
            <Icon className={cn(
              "w-5 h-5 flex-shrink-0 transition-colors",
              isActive ? "text-white" : "group-hover:text-primary"
            )} aria-hidden="true" />
            <span className={cn(
              "font-bold text-[13px] tracking-tight font-display",
              isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-900"
            )}>{item.label}</span>
        </div>
      </Link>
    </motion.li>
  );
});

const UserSection = memo(function UserSection({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="mt-auto px-4 pb-6">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-red-500 hover:bg-red-50 transition-colors focus:outline-none bg-neutral-50/50"
      >
        <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span>Logout</span>
      </button>
    </div>
  );
});

const Logo = memo(function Logo({ onClose }: { onClose?: () => void }) {
  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
      <Link href="/admin/dashboard" className="flex items-center gap-2.5 no-underline ml-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 font-display font-bold text-sm" aria-hidden="true">
              PM
          </div>
          <span className="font-bold text-[18px] tracking-tight text-neutral-900 truncate">Portfolio Manager</span>
      </Link>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 lg:hidden text-neutral-500 hover:text-neutral-700 focus:outline-none rounded-md flex-shrink-0"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

export function Sidebar({ isMobileOpen, onCloseMobile }: { isMobileOpen: boolean; onCloseMobile: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userRole = user?.role || 'assistant';
  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(userRole)
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push('/admin/login');
    if (onCloseMobile) onCloseMobile();
  }, [logout, router, onCloseMobile]);

  return (
    <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transition-transform lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
    )}>
        <Logo onClose={onCloseMobile} />
        <nav className="flex-1 overflow-y-auto p-3 h-[calc(100%-120px)]">
            <ul className="space-y-1">
                {filteredNavItems.map((item, index) => (
                    <SidebarItem 
                        key={item.id} 
                        item={item} 
                        index={index} 
                        isActive={pathname === item.path} 
                        onClick={onCloseMobile}
                    />
                ))}
            </ul>
        </nav>
        <UserSection onLogout={handleLogout} />
    </aside>
  );
}
