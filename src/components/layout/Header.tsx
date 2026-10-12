'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, ExternalLink, UserCheck, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const openCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Search trigger & Mobile Menu */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md mr-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition"
            title="Open Menu"
            type="button"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={openCommandPalette}
          type="button"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-950/40 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition text-sm group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
            <span className="truncate text-xs md:text-sm">Search products, orders, customers...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/60">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Add Product button */}
        <Link
          href="/products/new"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm shadow-indigo-600/20 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Add Product</span>
        </Link>

        {/* View Storefront Link */}
        <a
          href={process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
          title="Open BroHood Customer Storefront"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          <span>View Store</span>
        </a>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shadow-sm">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-xs font-semibold text-slate-200">Admin</span>
              <span className="text-[9px] font-medium uppercase px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Staff
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Store Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
