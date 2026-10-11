'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  CreditCard,
  IndianRupee,
  Layers,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to load analytics data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      toastError(err.message || 'Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2128] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#e5c158] font-bold">
              PERFORMANCE METRICS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Revenue & Sales Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Financial telemetry, payment channel breakdown, and category conversion rates.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14161f] border border-[#232634] hover:bg-[#1a1d29] text-zinc-300 text-xs font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#e5c158]" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#121318] border border-[#222533] rounded-2xl p-5">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Total Gross Revenue
          </span>
          <p className="text-3xl font-black text-white mt-2 font-mono">{formatINR(kpis.grossRevenue)}</p>
          <p className="text-[11px] text-emerald-400 mt-2">Delivered Cash + Verified Prepaid</p>
        </div>

        <div className="bg-[#121318] border border-[#222533] rounded-2xl p-5">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Average Order Value (AOV)
          </span>
          <p className="text-3xl font-black text-white mt-2 font-mono">
            {formatINR(kpis.totalOrders > 0 ? Math.round(kpis.grossRevenue / kpis.totalOrders) : 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-2">Per checkout transaction</p>
        </div>

        <div className="bg-[#121318] border border-[#222533] rounded-2xl p-5">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Active Inventory Valuation
          </span>
          <p className="text-3xl font-black text-[#e5c158] mt-2 font-mono">
            {formatINR(kpis.inventoryValue)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-2">Warehouse retail holding value</p>
        </div>
      </div>

      {/* Detailed Revenue Area Chart */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6">
        <h2 className="text-base font-bold text-white tracking-wide mb-1">
          30-Day Daily Gross Revenue Curve
        </h2>
        <p className="text-xs text-zinc-400 mb-6">Daily sales turnover in Indian Rupees (₹)</p>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenueTrend || []}>
              <defs>
                <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e5c158" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#e5c158" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181a24',
                  borderColor: '#2e3347',
                  borderRadius: '12px',
                  color: '#f3f4f6',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [formatINR(Number(val)), 'Turnover']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#e5c158"
                strokeWidth={3}
                fill="url(#goldArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Payment Method vs Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Channels */}
        <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6">
          <h2 className="text-base font-bold text-white tracking-wide mb-1">Payment Method Share</h2>
          <p className="text-xs text-zinc-400 mb-6">Razorpay UPI & Cards vs Cash on Delivery</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.paymentMethodData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="count"
                >
                  <Cell fill="#e5c158" />
                  <Cell fill="#38bdf8" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181a24',
                    borderColor: '#2e3347',
                    borderRadius: '12px',
                    color: '#f3f4f6',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#1f2128]">
            {(data?.paymentMethodData || []).map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-zinc-300">{p.name}</span>
                <span className="font-mono font-bold text-white">{p.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Contribution */}
        <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6">
          <h2 className="text-base font-bold text-white tracking-wide mb-1">Category Sales Ratio</h2>
          <p className="text-xs text-zinc-400 mb-6">Watches vs Sneakers vs Goggles vs Apparel</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryChartData || []}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181a24',
                    borderColor: '#2e3347',
                    borderRadius: '12px',
                    color: '#f3f4f6',
                  }}
                />
                <Bar dataKey="value" fill="#e5c158" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
