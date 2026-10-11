'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ShoppingBag, Layers, Users, Tag, ArrowRight, X, BarChart3 } from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  type: 'page' | 'action';
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const STATIC_ITEMS: SearchItem[] = [
  { id: 'p-1', title: 'Dashboard & KPI Analytics', type: 'page', href: '/', icon: ShoppingBag, badge: 'Overview' },
  { id: 'p-8', title: 'Revenue & Sales Performance Analytics', type: 'page', href: '/analytics', icon: BarChart3, badge: 'Analytics' },
  { id: 'p-2', title: 'Product Catalog Management', type: 'page', href: '/products', icon: Package, badge: 'Products' },
  { id: 'p-3', title: 'Add New Product Drop', type: 'action', href: '/products/new', icon: Package, badge: 'Create' },
  { id: 'p-4', title: 'Live Inventory & Variant Editor', type: 'page', href: '/inventory', icon: Layers, badge: 'Stock' },
  { id: 'p-5', title: 'Orders & Courier Dispatch', type: 'page', href: '/orders', icon: ShoppingBag, badge: 'Orders' },
  { id: 'p-6', title: 'Customer & User Directory', type: 'page', href: '/users', icon: Users, badge: 'Users' },
  { id: 'p-7', title: 'Coupon Code & Promo Discounts', type: 'page', href: '/coupons', icon: Tag, badge: 'Promos' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = STATIC_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    (item.badge && item.badge.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#121318] border border-[#262833] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1f2128]">
          <Search className="w-5 h-5 text-[#e5c158]" />
          <input
            type="text"
            placeholder="Type a command or jump to page... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-gray-100 placeholder-zinc-500 text-sm focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-sm">
              No matching pages or actions found.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1c1e28] text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#181a24] border border-[#2a2d3d] flex items-center justify-center text-[#e5c158] group-hover:border-[#e5c158]/40 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 group-hover:bg-[#e5c158]/10 group-hover:text-[#e5c158] transition">
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#e5c158] transform group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-[#0e0f14] border-t border-[#1f2128] flex items-center justify-between text-[11px] text-zinc-500">
          <span>Navigation Quick Switcher</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">↑↓</kbd> to navigate
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
