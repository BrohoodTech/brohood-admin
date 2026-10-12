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
  { id: 'p-1', title: 'Dashboard overview', type: 'page', href: '/', icon: ShoppingBag, badge: 'Overview' },
  { id: 'p-8', title: 'Analytics & reports', type: 'page', href: '/analytics', icon: BarChart3, badge: 'Analytics' },
  { id: 'p-2', title: 'Product catalog', type: 'page', href: '/products', icon: Package, badge: 'Products' },
  { id: 'p-3', title: 'Add new product', type: 'action', href: '/products/new', icon: Package, badge: 'Create' },
  { id: 'p-4', title: 'Inventory & stock levels', type: 'page', href: '/inventory', icon: Layers, badge: 'Stock' },
  { id: 'p-5', title: 'Orders & fulfillment', type: 'page', href: '/orders', icon: ShoppingBag, badge: 'Orders' },
  { id: 'p-6', title: 'Customer directory', type: 'page', href: '/users', icon: Users, badge: 'Customers' },
  { id: 'p-7', title: 'Discounts & coupons', type: 'page', href: '/coupons', icon: Tag, badge: 'Promos' },
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <Search className="w-4 h-4 text-indigo-400" />
          <input
            type="text"
            placeholder="Type to search pages or actions... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
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
                    type="button"
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/60 text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition">
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transform group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Quick Navigator</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↑↓</kbd> to navigate
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
