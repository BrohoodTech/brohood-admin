'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Shield, Sparkles, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { success, error: toastError } = useToast();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toastError('Please enter the Admin Master Key');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || 'Access Denied. Incorrect Master Key.');
        setLoading(false);
        return;
      }

      success('Access Granted. Welcome to BroHood Command Center.');
      router.push(redirectPath);
      router.refresh();
    } catch {
      toastError('Authentication request failed. Check server connection.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Master Security Key / PIN
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <KeyRound className="w-4 h-4 text-[#e5c158]" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password / PIN"
            className="w-full pl-10 pr-12 py-3.5 bg-[#0a0b0e] border border-[#272a39] rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#e5c158] transition"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] hover:from-[#fbe294] hover:to-[#edd06f] text-black font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#e5c158]/15 hover:shadow-[#e5c158]/30 transition transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Authenticate Session</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0b0e]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e5c158]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo and Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f5d376] via-[#e5c158] to-[#997720] shadow-xl shadow-[#e5c158]/15 mb-4 border border-[#f5d376]/40">
            <span className="text-black font-extrabold text-3xl tracking-tighter">BH</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            BROHOOD <Sparkles className="w-5 h-5 text-[#e5c158]" />
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#e5c158] font-semibold mt-1">
            Operations & Admin Gate
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Enter your administrative PIN or Master Secret to access the command center.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#121318] border border-[#232634] rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e5c158] to-transparent opacity-80" />

          <Suspense
            fallback={
              <div className="py-8 text-center text-zinc-500 text-xs">Loading Security Gate...</div>
            }
          >
            <LoginForm />
          </Suspense>

          {/* Security Note */}
          <div className="mt-6 pt-5 border-t border-[#1c1e28] flex items-center justify-between text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 256-bit Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Direct PostgreSQL Access</span>
            </div>
          </div>
        </div>

        {/* Quick hint for development */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-zinc-600">
            Default Key: <span className="font-mono text-zinc-400">brohood_admin_secret_2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
