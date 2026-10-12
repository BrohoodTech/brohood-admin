'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Shield, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
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
      toastError('Please enter your Admin Password');
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
        toastError(data.error || 'Access Denied. Incorrect Password.');
        setLoading(false);
        return;
      }

      success('Sign in successful. Welcome back!');
      router.push(redirectPath);
      router.refresh();
    } catch {
      toastError('Authentication request failed. Check server connection.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Admin Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <KeyRound className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter store admin password"
            className="w-full pl-10 pr-12 py-2.5 bg-slate-950/40 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs uppercase tracking-wider transition shadow-sm shadow-indigo-600/25 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Sign In to Admin</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-400">
        {/* Logo and Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-md shadow-indigo-600/20 mb-3">
            BH
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            BroHood Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your store management dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-md relative overflow-hidden">
          <Suspense
            fallback={
              <div className="py-8 text-center text-slate-500 text-xs">Loading sign in...</div>
            }
          >
            <LoginForm />
          </Suspense>

          {/* Security Note */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted Session</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Admin Access Only</span>
            </div>
          </div>
        </div>

        {/* Development Hint */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Default Key: <span className="font-mono text-slate-400">brohood_admin_secret_2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
