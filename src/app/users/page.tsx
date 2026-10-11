'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  MessageCircle,
  ShoppingBag,
  MapPin,
  Sparkles,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2128] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#e5c158] font-bold">
              CUSTOMER DIRECTORY
            </span>
            <span className="text-zinc-500 font-mono text-xs">({customers.length} Profiles)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Customer & VIP Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Lifetime buyer metrics, delivery address books, order frequency, and direct WhatsApp communication.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14161f] border border-[#232634] hover:bg-[#1a1d29] text-zinc-300 text-xs font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#e5c158]" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl p-4 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#e5c158]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#181a24] text-[11px] font-semibold text-zinc-300 hover:text-white border border-[#2e3347]"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2128] bg-[#0e0f14] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c26]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    <div className="w-8 h-8 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading customer profiles...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    No customers found matching search query.
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => {
                  const isVip = c.lifetime_spend >= 10000;
                  const phoneClean = c.phone?.replace(/\D/g, '') || '';

                  return (
                    <tr key={idx} className="hover:bg-[#151722] transition group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1a1d29] to-[#25293d] border border-[#2e334a] flex items-center justify-center text-[#e5c158] font-bold text-xs">
                            {c.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white block">{c.full_name}</span>
                              {isVip && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  <Crown className="w-2.5 h-2.5 text-[#e5c158]" /> VIP
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              Joined: {formatDate(c.created_at)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-zinc-300 block">
                          {c.phone || 'No phone'}
                        </span>
                        <span className="text-[11px] text-zinc-500 block truncate max-w-[180px]">
                          {c.email || 'No email attached'}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {c.role}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white text-xs">
                          {c.orders_count} orders
                        </span>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#e5c158] text-xs">
                        {formatINR(c.lifetime_spend)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {phoneClean && (
                            <a
                              href={`https://wa.me/91${phoneClean}?text=Hello%20${encodeURIComponent(
                                c.full_name || ''
                              )},%20this%20is%20BroHood%20Concierge.`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 rounded-lg bg-[#181a24] hover:bg-[#232738] text-zinc-300 hover:text-white border border-[#2b2f42] transition cursor-pointer"
                            title="View Customer Profile"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-[#272b3b] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1f2128]">
              <div>
                <span className="text-[10px] font-mono text-[#e5c158] uppercase">Customer File</span>
                <h3 className="text-lg font-bold text-white">{selectedCustomer.full_name}</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-5 text-xs">
              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0a0b0e] border border-[#202330]">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase font-mono block">
                    Lifetime Spend
                  </span>
                  <span className="font-mono font-bold text-base text-[#e5c158]">
                    {formatINR(selectedCustomer.lifetime_spend)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase font-mono block">
                    Total Purchases
                  </span>
                  <span className="font-mono font-bold text-base text-white">
                    {selectedCustomer.orders_count} orders
                  </span>
                </div>
              </div>

              {/* Delivery Address Book */}
              <div>
                <span className="text-zinc-400 font-bold uppercase tracking-wider block mb-2 text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#e5c158]" />
                  Delivery Addresses
                </span>
                {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                  <p className="text-zinc-600 italic">No saved delivery address recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#161822] border border-[#232635]">
                        <p className="font-semibold text-white">{addr.address_line1}</p>
                        <p className="text-zinc-400">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Orders */}
              <div>
                <span className="text-zinc-400 font-bold uppercase tracking-wider block mb-2 text-[10px] flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#e5c158]" />
                  Past Order History
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCustomer.orders.map((ord: any) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#161822] border border-[#232635]"
                    >
                      <div>
                        <span className="font-mono font-bold text-white block">
                          {ord.order_number}
                        </span>
                        <span className="text-[10px] text-zinc-500">{formatDate(ord.created_at)}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-white block">
                          {formatINR(ord.final_total)}
                        </span>
                        <span className="text-[10px] text-zinc-400 capitalize">
                          {ord.order_status} ({ord.payment_method})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1f2128] flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
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
