'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  MessageCircle,
  ShoppingBag,
  MapPin,
  Crown,
  ChevronRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { formatINR, formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export default function UsersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const { error: toastError } = useToast();

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Failed to load customers');
      const data = await res.json();
      setCustomers(data || []);
    } catch (err: any) {
      toastError(err.message || 'Error fetching user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Customer Directory
            </span>
            <span className="text-slate-500 text-xs font-mono">({customers.length} total)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Customers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View customer details, lifetime purchase volume, addresses, and chat directly on WhatsApp.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2 rounded-lg bg-slate-950/40 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <Users className="w-9 h-9 text-slate-600 mx-auto mb-2" />
                    No customers found matching search query.
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => {
                  const isVip = (c.lifetime_spend || 0) >= 10000;
                  const phoneClean = c.phone?.replace(/\D/g, '') || '';

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold text-xs">
                            {c.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{c.full_name || 'Anonymous User'}</span>
                              {isVip && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  <Crown className="w-2.5 h-2.5 text-amber-400" /> VIP
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Joined {formatDate(c.created_at)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-slate-300 block">
                          {c.phone || 'No phone'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                          {c.email || 'No email'}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {c.role}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200 text-xs">
                          {c.orders_count || 0} {c.orders_count === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-200 text-xs">
                        {formatINR(c.lifetime_spend || 0)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {phoneClean && (
                            <a
                              href={`https://wa.me/91${phoneClean}?text=Hello%20${encodeURIComponent(
                                c.full_name || ''
                              )},%20this%20is%20BroHood%20Store%20Support.`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition inline-flex items-center gap-1 text-[11px]"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                            title="View Customer Details"
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

      {/* Customer Profile & Address Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Customer Details</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedCustomer.full_name || 'Customer'}</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-5 text-xs">
              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    Total Spent
                  </span>
                  <span className="font-mono font-bold text-base text-white mt-0.5 block">
                    {formatINR(selectedCustomer.lifetime_spend || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                    Total Purchases
                  </span>
                  <span className="font-mono font-bold text-base text-white mt-0.5 block">
                    {selectedCustomer.orders_count || 0} orders
                  </span>
                </div>
              </div>

              {/* Delivery Address Book */}
              <div>
                <span className="text-slate-300 font-semibold uppercase tracking-wider block mb-2 text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Delivery Addresses
                </span>
                {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                  <p className="text-slate-500 italic p-3 rounded-lg bg-slate-950/30 border border-slate-800/60">No saved delivery address recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                        <p className="font-medium text-white">{addr.address_line1}</p>
                        {addr.address_line2 && <p className="text-slate-400">{addr.address_line2}</p>}
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Orders */}
              <div>
                <span className="text-slate-300 font-semibold uppercase tracking-wider block mb-2 text-[10px] flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                  Past Order History
                </span>
                {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                  <p className="text-slate-500 italic p-3 rounded-lg bg-slate-950/30 border border-slate-800/60">No past orders found.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCustomer.orders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800"
                      >
                        <div>
                          <span className="font-mono font-medium text-white block">
                            {ord.order_number}
                          </span>
                          <span className="text-[10px] text-slate-500">{formatDate(ord.created_at)}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-semibold text-slate-200 block">
                            {formatINR(ord.final_total)}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {ord.order_status} ({ord.payment_method?.toUpperCase()})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
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
