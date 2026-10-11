'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, ExternalLink, ShieldCheck, UserCheck, Menu } from 'lucide-react';

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
    <header className="h-20 bg-[#0e0f14]/80 backdrop-blur-xl border-b border-[#1f2128] sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Search trigger & Mobile Menu */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md mr-2">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#14161f] border border-[#232634] text-zinc-400 hover:text-[#e5c158] transition"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={openCommandPalette}
          className="w-full flex items-center justify-between px-3 md:px-4 py-2.5 rounded-xl bg-[#14161f] border border-[#232634] text-zinc-400 hover:border-[#e5c158]/50 hover:text-zinc-200 transition text-sm shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#e5c158] group-hover:scale-110 transition" />
            <span className="truncate">Search products, orders...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] bg-[#1d202d] text-zinc-400 px-2 py-0.5 rounded border border-[#2c3044]">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick New Drop button */}
        <Link
          href="/products/new"
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] hover:from-[#fbe294] hover:to-[#edd06f] text-black font-semibold text-xs tracking-wider uppercase transition shadow-md shadow-[#e5c158]/10 hover:shadow-[#e5c158]/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">New Drop</span>
        </Link>

        {/* View Storefront Link */}
        <a
          href={process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14161f] border border-[#232634] hover:bg-[#1a1d29] text-zinc-300 text-xs font-medium transition"
          title="Open BroHood Customer Storefront"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#e5c158]" />
          <span>Storefront</span>
        </a>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#222533]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1b1e2a] to-[#25293d] border border-[#32364e] flex items-center justify-center text-[#e5c158] shadow-sm">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">BROHOOD</span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                HQ
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">Master Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
}
