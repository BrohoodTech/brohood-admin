'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Layers,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { formatINR, formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';
import { Order, OrderStatus } from '@/lib/types';

const PIE_COLORS = ['#e5c158', '#38bdf8', '#34d399', '#f472b6'];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to load dashboard data');
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

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      success(`Order status updated to ${newStatus.toUpperCase()}`);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-3 border-[#e5c158] border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm tracking-wider uppercase">Loading Executive Command Center...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const statusCounts = kpis.orderStatusCounts || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Banner & Date Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2128] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#e5c158] font-bold">
              BROHOOD OPERATIONS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Executive Command Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Live telemetry for watches, hype kicks, goggles, and apparel drops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14161f] border border-[#232634] hover:bg-[#1a1d29] text-zinc-300 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#e5c158]" />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/products/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] hover:from-[#fbe294] hover:to-[#edd06f] text-black font-semibold text-xs tracking-wider uppercase transition shadow-md shadow-[#e5c158]/15"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Drop</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Gross Revenue */}
        <div className="bg-[#121318] border border-[#222533] hover:border-[#e5c158]/40 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="absolute top-0 right-0 p-4 text-[#e5c158]/20 group-hover:text-[#e5c158]/40 transition">
            <TrendingUp className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Total Gross Revenue
          </span>
          <div className="text-2xl lg:text-3xl font-black text-white mt-2 tracking-tight">
            {formatINR(kpis.grossRevenue)}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Prepaid + Delivered COD
            </span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-[#121318] border border-[#222533] hover:border-[#e5c158]/40 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="absolute top-0 right-0 p-4 text-sky-400/20 group-hover:text-sky-400/40 transition">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Orders Placed
          </span>
          <div className="text-2xl lg:text-3xl font-black text-white mt-2 tracking-tight">
            {kpis.totalOrders}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {statusCounts.placed || 0} Placed
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
              {statusCounts.shipped || 0} Shipped
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {statusCounts.delivered || 0} Delivered
            </span>
          </div>
        </div>

        {/* KPI 3: Inventory Value & Low Stock */}
        <div className="bg-[#121318] border border-[#222533] hover:border-[#e5c158]/40 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="absolute top-0 right-0 p-4 text-amber-400/20 group-hover:text-amber-400/40 transition">
            <Layers className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Live Inventory Value
          </span>
          <div className="text-2xl lg:text-3xl font-black text-white mt-2 tracking-tight">
            {formatINR(kpis.inventoryValue)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">{kpis.totalStockUnits} units in stock</span>
            {kpis.lowStockCount > 0 ? (
              <Link
                href="/inventory?filter=low"
                className="flex items-center gap-1 text-rose-400 font-semibold hover:underline"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{kpis.lowStockCount} Low Stock</span>
              </Link>
            ) : (
              <span className="text-emerald-400 font-medium">Stock Healthy</span>
            )}
          </div>
        </div>

        {/* KPI 4: Customers */}
        <div className="bg-[#121318] border border-[#222533] hover:border-[#e5c158]/40 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="absolute top-0 right-0 p-4 text-purple-400/20 group-hover:text-purple-400/40 transition">
            <Users className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Customer Directory
          </span>
          <div className="text-2xl lg:text-3xl font-black text-white mt-2 tracking-tight">
            {kpis.totalCustomers}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
            <span>VIP & Guest buyers</span>
            <Link href="/users" className="text-[#e5c158] hover:underline flex items-center gap-0.5">
              <span>View List</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Trend (Last 30 Days) */}
        <div className="lg:col-span-2 bg-[#121318] border border-[#222533] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Daily Revenue Volume</h2>
              <p className="text-xs text-zinc-400">Sales generated across the last 30 operational days</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#e5c158] bg-[#e5c158]/10 px-2.5 py-1 rounded-lg border border-[#e5c158]/20">
              <span>₹ INR</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTrend || []}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e5c158" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e5c158" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
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
                  formatter={(val: any) => [formatINR(Number(val)), 'Sales Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#e5c158"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payment Method Breakdown */}
        <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white tracking-wide">Payment Distribution</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                COD vs Online
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">Razorpay UPI/Cards vs Cash on Delivery</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.paymentMethodData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
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
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => [`${val} orders`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#1f2128]">
            {(data?.paymentMethodData || []).map((method: any, idx: number) => (
              <div key={method.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: idx === 0 ? '#e5c158' : '#38bdf8' }}
                  />
                  <span className="text-zinc-300 font-medium">{method.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">{method.count} orders</span>
                  <span className="text-white font-mono font-bold">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Low Stock Alert Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white tracking-wide">Category Performance</h2>
            <Link href="/products" className="text-xs text-[#e5c158] hover:underline">
              View Catalog
            </Link>
          </div>
          <p className="text-xs text-zinc-400 mb-6">Distribution between Watches, Sneakers, Goggles & Streetwear</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryChartData || []} layout="vertical">
                <XAxis type="number" stroke="#52525b" fontSize={11} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181a24',
                    borderColor: '#2e3347',
                    borderRadius: '12px',
                    color: '#f3f4f6',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}`, 'Value Ratio']}
                />
                <Bar dataKey="value" fill="#e5c158" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning Center */}
        <div className="lg:col-span-2 bg-[#121318] border border-[#222533] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Critical Low Stock Radar</h2>
                <p className="text-xs text-zinc-400">Variants with 3 or fewer units remaining</p>
              </div>
            </div>
            <Link
              href="/inventory"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181a24] border border-[#2b2f42] text-xs font-semibold text-zinc-200 hover:text-white hover:border-[#e5c158]/50 transition"
            >
              <span>Restock Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#e5c158]" />
            </Link>
          </div>

          <div className="space-y-3 mt-5">
            {(!data?.lowStockVariants || data.lowStockVariants.length === 0) ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                All inventory items are currently well-stocked above alert thresholds.
              </div>
            ) : (
              data.lowStockVariants.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#161822] border border-[#232635] hover:border-rose-500/30 transition"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-white truncate">{item.productTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-zinc-400 font-medium">{item.variantName}</span>
                      <span className="text-[10px] font-mono text-zinc-500">({item.sku})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        item.stock === 0
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.stock === 0 ? 'OUT OF STOCK' : `${item.stock} left`}
                    </span>
                    <Link
                      href={`/inventory?sku=${encodeURIComponent(item.sku)}`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#e5c158]/10 text-[#e5c158] hover:bg-[#e5c158] hover:text-black transition"
                    >
                      Adjust
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Recent Orders Stream</h2>
            <p className="text-xs text-zinc-400">Latest customer orders with quick fulfillment status controls</p>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#171924] border border-[#262a3d] hover:border-[#e5c158]/40 text-xs font-semibold text-zinc-200 transition"
          >
            <span>All Orders Board</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#e5c158]" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2128] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Courier</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c26]">
              {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order: Order) => {
                  const statusStyle = getStatusColor(order.order_status);
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-[#151722] transition group">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <Link href={`/orders`} className="hover:text-[#e5c158] transition">
                          {order.order_number}
                        </Link>
                        <span className="block text-[10px] font-normal text-zinc-500">
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-200 block">
                          {order.shipping_address?.full_name || 'Guest User'}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {order.shipping_address?.city}, {order.shipping_address?.state}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                            order.payment_method === 'cod'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {order.payment_method === 'cod' ? 'COD' : 'RAZORPAY'}
                        </span>
                        <span className="block text-[10px] text-zinc-500 capitalize mt-0.5">
                          {order.payment_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white font-mono">
                        {formatINR(order.final_total)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {order.order_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-400">
                        {order.courier_partner ? (
                          <div>
                            <span className="font-medium text-zinc-200">{order.courier_partner}</span>
                            <span className="block text-[10px] font-mono text-zinc-500">
                              {order.tracking_number || 'No AWB'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick 1-Click Status Progression */}
                          {order.order_status === 'placed' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickStatusChange(order.id, 'confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/30 text-[11px] font-semibold transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {order.order_status === 'confirmed' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickStatusChange(order.id, 'shipped')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black border border-amber-500/30 text-[11px] font-semibold transition cursor-pointer"
                            >
                              Ship
                            </button>
                          )}
                          {order.order_status === 'shipped' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickStatusChange(order.id, 'delivered')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-[11px] font-semibold transition cursor-pointer"
                            >
                              Delivered
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg bg-[#191c28] hover:bg-[#222638] text-zinc-400 hover:text-white transition cursor-pointer"
                            title="Quick View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Order Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-[#272b3b] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1f2128]">
              <div>
                <span className="text-[10px] font-mono text-[#e5c158] uppercase">Order Details</span>
                <h3 className="text-lg font-bold text-white">{selectedOrder.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="text-zinc-500 block mb-1 font-semibold uppercase text-[10px]">
                  Customer & Shipping Address
                </span>
                <p className="font-bold text-zinc-200">{selectedOrder.shipping_address?.full_name}</p>
                <p className="text-zinc-400">{selectedOrder.shipping_address?.phone}</p>
                <p className="text-zinc-400">
                  {selectedOrder.shipping_address?.address_line1}, {selectedOrder.shipping_address?.city},{' '}
                  {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1f2128]">
                <span className="text-zinc-500 block mb-2 font-semibold uppercase text-[10px]">Order Items</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(selectedOrder.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#181a24]">
                      <div>
                        <p className="font-semibold text-white">{item.variant_name || 'Product Item'}</p>
                        <p className="text-[10px] text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-bold text-[#e5c158]">
                        {formatINR(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f2128] flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-400">Final Total:</span>
                <span className="text-white font-mono">{formatINR(selectedOrder.final_total)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1f2128] flex gap-3">
              <Link
                href="/orders"
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] text-black font-bold text-center text-xs tracking-wider uppercase"
              >
                Go to Full Orders Board
              </Link>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
