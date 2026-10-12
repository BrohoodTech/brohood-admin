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
  RotateCcw,
  Plus,
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

const PIE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-medium tracking-wide">Loading dashboard overview...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const statusCounts = kpis.orderStatusCounts || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Overview
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-slate-400">Live data</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Store Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor revenue, customer orders, and inventory status in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
          <Link
            href="/products/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Revenue</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatINR(kpis.grossRevenue)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Verified
            </span>
            <span>Prepaid & Delivered COD</span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Orders</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis.totalOrders}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              {statusCounts.placed || 0} Placed
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
              {statusCounts.shipped || 0} Shipped
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
              {statusCounts.delivered || 0} Delivered
            </span>
          </div>
        </div>

        {/* KPI 3: Inventory Value & Low Stock */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Inventory Value</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatINR(kpis.inventoryValue)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{kpis.totalStockUnits} units in stock</span>
            {kpis.lowStockCount > 0 ? (
              <Link
                href="/inventory?filter=low"
                className="flex items-center gap-1 text-rose-400 font-medium hover:underline"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{kpis.lowStockCount} Low stock</span>
              </Link>
            ) : (
              <span className="text-emerald-400 font-medium">Stock healthy</span>
            )}
          </div>
        </div>

        {/* KPI 4: Customers */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Customers</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis.totalCustomers}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Registered users</span>
            <Link href="/users" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5">
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Revenue Trend (Last 30 Days) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Daily Revenue</h2>
              <p className="text-xs text-slate-400">Sales volume over the last 30 operational days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60 font-medium">
              <span>INR (₹)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTrend || []}>
                <defs>
                  <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                  }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Sales Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#indigoGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payment Method Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white">Payment Methods</h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                Breakdown
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Cash on Delivery vs Online Gateway</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.paymentMethodData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#0ea5e9" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => [`${val} orders`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-800">
            {(data?.paymentMethodData || []).map((method: any, idx: number) => (
              <div key={method.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: idx === 0 ? '#6366f1' : '#0ea5e9' }}
                  />
                  <span className="text-slate-300 font-medium">{method.name}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-400">{method.count} orders</span>
                  <span className="text-white font-mono font-semibold">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Low Stock Alert Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white">Categories</h2>
            <Link href="/products" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View catalog
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-4">Stock distribution across product categories</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryChartData || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}`, 'Variants']}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning Center */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Low Stock Items</h2>
                <p className="text-xs text-slate-400">Items with 3 or fewer units remaining</p>
              </div>
            </div>
            <Link
              href="/inventory"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white hover:border-slate-600 transition"
            >
              <span>Manage inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          <div className="space-y-2 mt-4">
            {(!data?.lowStockVariants || data.lowStockVariants.length === 0) ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                All inventory items are currently well-stocked.
              </div>
            ) : (
              data.lowStockVariants.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-medium text-slate-200 truncate">{item.productTitle}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">{item.variantName}</span>
                      <span className="text-[10px] font-mono text-slate-500">({item.sku})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                        item.stock === 0
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                    </span>
                    <Link
                      href={`/inventory?sku=${encodeURIComponent(item.sku)}`}
                      className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      Update
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            <p className="text-xs text-slate-400">Latest customer orders with quick fulfillment status controls</p>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <span>View all orders</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Courier</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order: Order) => {
                  const statusStyle = getStatusColor(order.order_status);
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-mono font-medium text-slate-200">
                        <Link href="/orders" className="hover:text-indigo-400 transition">
                          {order.order_number}
                        </Link>
                        <span className="block text-[10px] font-normal text-slate-500 font-sans">
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-200 block">
                          {order.shipping_address?.full_name || 'Guest User'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.shipping_address?.city}, {order.shipping_address?.state}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-medium border ${
                            order.payment_method === 'cod'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {order.payment_method === 'cod' ? 'COD' : 'Online'}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize mt-0.5">
                          {order.payment_status}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-white font-mono">
                        {formatINR(order.final_total)}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {order.order_status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        {order.courier_partner ? (
                          <div>
                            <span className="font-medium text-slate-200">{order.courier_partner}</span>
                            <span className="block text-[10px] font-mono text-slate-500">
                              {order.tracking_number || 'No AWB'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick 1-Click Status Progression */}
                          {order.order_status === 'placed' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickStatusChange(order.id, 'confirmed')}
                              type="button"
                              className="px-2 py-1 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/20 text-[11px] font-medium transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {order.order_status === 'confirmed' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickStatusChange(order.id, 'shipped')}
                              type="button"
                              className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black border border-amber-500/20 text-[11px] font-medium transition cursor-pointer"
                            >
                              Ship
                            </button>
                          )}
                          {order.order_status === 'shipped' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickStatusChange(order.id, 'delivered')}
                              type="button"
                              className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-[11px] font-medium transition cursor-pointer"
                            >
                              Deliver
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrder(order)}
                            type="button"
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase">Order summary</span>
                <h3 className="text-base font-bold text-white">{selectedOrder.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                type="button"
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-medium uppercase text-[10px]">
                  Customer & Shipping Address
                </span>
                <p className="font-semibold text-slate-200">{selectedOrder.shipping_address?.full_name}</p>
                <p className="text-slate-400">{selectedOrder.shipping_address?.phone}</p>
                <p className="text-slate-400">
                  {selectedOrder.shipping_address?.address_line1}, {selectedOrder.shipping_address?.city},{' '}
                  {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-2 font-medium uppercase text-[10px]">Order Items</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {(selectedOrder.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                      <div>
                        <p className="font-medium text-slate-200">{item.variant_name || 'Product Item'}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-medium text-slate-200">
                        {formatINR(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-400">Total:</span>
                <span className="text-white font-mono">{formatINR(selectedOrder.final_total)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-2.5">
              <Link
                href="/orders"
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-center text-xs transition"
              >
                Open Orders page
              </Link>
              <button
                onClick={() => setSelectedOrder(null)}
                type="button"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
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
