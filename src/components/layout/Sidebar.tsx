'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  collapsed: controlledCollapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { info } = useToast();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed((prev) => !prev));

  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  useEffect(() => {
    // Close mobile sidebar on route change
    if (onCloseMobile) onCloseMobile();
  }, [pathname]);

  useEffect(() => {
    // Fetch quick stats for badge count
    async function fetchBadgeCounts() {
      try {
        const res = await fetch('/api/stats/quick-badges');
        if (res.ok) {
          const data = await res.json();
          setPendingOrdersCount(data.pendingOrders || 0);
          setLowStockCount(data.lowStock || 0);
        }
      } catch {
        // silent fallback
      }
    }
    fetchBadgeCounts();
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      label: 'Products',
      href: '/products',
      icon: Package,
    },
    {
      label: 'Inventory',
      href: '/inventory',
      icon: Layers,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      label: 'Orders',
      href: '/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      label: 'Customers',
      href: '/users',
      icon: Users,
    },
    {
      label: 'Coupons',
      href: '/coupons',
      icon: Tag,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      info('Signed out of BroHood Admin');
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-[#0e0f14] border-r border-[#1f2128] transition-all duration-300 flex flex-col justify-between select-none shadow-2xl md:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          collapsed ? 'md:w-20' : 'md:w-64',
          'w-64'
        )}
      >
        {/* Brand Header */}
        <div>
          <div className="h-20 flex items-center justify-between px-5 border-b border-[#1f2128]/80">
            {!collapsed ? (
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f5d376] via-[#e5c158] to-[#997720] flex items-center justify-center shadow-lg shadow-[#e5c158]/10 group-hover:shadow-[#e5c158]/25 transition duration-300">
                  <span className="text-black font-extrabold text-xl tracking-tighter">BH</span>
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    BROHOOD <Sparkles className="w-3.5 h-3.5 text-[#e5c158]" />
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#e5c158]/90 font-medium block">
                    Admin Command
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/" className="mx-auto">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f5d376] via-[#e5c158] to-[#997720] flex items-center justify-center">
                  <span className="text-black font-extrabold text-xl tracking-tighter">BH</span>
                </div>
              </Link>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-[#181a22] transition"
                title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#181a22] transition"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-gradient-to-r from-[#e5c158]/15 to-transparent text-[#f5d376] border-l-2 border-[#e5c158]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#151720]'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive ? 'text-[#e5c158]' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border',
                      item.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {collapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-[#1f2128]/80 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-[#14151c] border border-[#21232e] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-zinc-400 font-medium">Supabase RLS: Bypass</span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer',
            collapsed && 'justify-center'
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
