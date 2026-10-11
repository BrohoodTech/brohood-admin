'use client';

import React, { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastProvider } from '@/components/common/Toast';
import { CommandPalette } from '@/components/common/CommandPalette';
import { cn } from '@/lib/utils';

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoginPage) {
    return (
      <ToastProvider>
        <main className="min-h-screen bg-[#0a0b0e] text-zinc-100 flex flex-col justify-center items-center">
          {children}
        </main>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0a0b0e] text-zinc-100 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div
          className={cn(
            'flex-1 flex flex-col transition-all duration-300 min-w-0',
            collapsed ? 'md:pl-20' : 'md:pl-64',
            'pl-0'
          )}
        >
          <Header onToggleMobileMenu={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            {children}
          </main>
        </div>

        {/* Global Modal / Command Palette */}
        <CommandPalette />
      </div>
    </ToastProvider>
  );
}
