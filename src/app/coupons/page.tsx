'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Percent,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { Coupon } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [description, setDescription] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete State
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  const { success, error: toastError } = useToast();

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      if (!res.ok) throw new Error('Failed to load coupons');
      const data = await res.json();
      setCoupons(data || []);
    } catch (err: any) {
      toastError(err.message || 'Error fetching promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleToggleActive = async (c: Coupon) => {
    const newStatus = !c.is_active;
    // Optimistic
    setCoupons((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, is_active: newStatus } : item))
    );

    try {
      const res = await fetch(`/api/coupons/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to toggle coupon');
      success(`Coupon "${c.code}" is now ${newStatus ? 'Active' : 'Deactivated'}`);
    } catch (err: any) {
      toastError(err.message || 'Error updating coupon');
      loadCoupons();
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      const res = await fetch(`/api/coupons/${couponToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete coupon');
      success(`Coupon "${couponToDelete.code}" deleted`);
      setCoupons((prev) => prev.filter((item) => item.id !== couponToDelete.id));
      setCouponToDelete(null);
    } catch (err: any) {
      toastError(err.message || 'Error deleting coupon');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toastError('Please specify Coupon Code and Discount Value');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_order_value: Number(minOrderValue) || 0,
          max_discount: Number(maxDiscount) || null,
          description: description.trim() || null,
          valid_until: validUntil ? new Date(validUntil).toISOString() : null,
          is_active: true,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create coupon');
      }

      success(`Promo code "${code.toUpperCase()}" created and active!`);
      setShowModal(false);
      setCode('');
      setDiscountValue('');
      setMinOrderValue('');
      setMaxDiscount('');
      setDescription('');
      loadCoupons();
    } catch (err: any) {
      toastError(err.message || 'Error creating coupon');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2128] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#e5c158] font-bold">
              PROMOTIONS & DISCOUNTS
            </span>
            <span className="text-zinc-500 font-mono text-xs">({coupons.length} Active Vouchers)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Coupon Code Manager
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Percentage discounts, flat cash vouchers, cart minimums, and promotional campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCoupons}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14161f] border border-[#232634] hover:bg-[#1a1d29] text-zinc-300 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#e5c158]" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] hover:from-[#fbe294] hover:to-[#edd06f] text-black font-bold text-xs tracking-wider uppercase transition shadow-md shadow-[#e5c158]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2128] bg-[#0e0f14] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Requirements</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c26]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    <div className="w-8 h-8 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    <Tag className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    No promotional coupons configured yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#151722] transition group">
                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#e5c158] bg-[#e5c158]/10 px-2.5 py-1 rounded-lg border border-[#e5c158]/25 tracking-wide">
                          {c.code}
                        </span>
                      </div>
                      <span className="block text-[10px] text-zinc-500 mt-1">
                        Created: {formatDate(c.created_at)}
                      </span>
                    </td>

                    {/* Discount Value */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        {c.discount_type === 'percentage' ? (
                          <>
                            <Percent className="w-3.5 h-3.5 text-[#e5c158]" />
                            <span>{c.discount_value}% OFF</span>
                          </>
                        ) : (
                          <>
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Flat {formatINR(c.discount_value)} OFF</span>
                          </>
                        )}
                      </div>
                      {c.max_discount && c.discount_type === 'percentage' && (
                        <span className="block text-[10px] text-zinc-500 font-mono">
                          Max Cap: {formatINR(c.max_discount)}
                        </span>
                      )}
                    </td>

                    {/* Requirements */}
                    <td className="py-3.5 px-4">
                      <span className="text-zinc-300 font-medium">
                        Min Cart: {c.min_order_value > 0 ? formatINR(c.min_order_value) : 'No Min'}
                      </span>
                      {c.valid_until && (
                        <span className="block text-[10px] text-zinc-500">
                          Expires: {formatDate(c.valid_until)}
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-zinc-400 max-w-xs truncate">
                      {c.description || 'No description provided'}
                    </td>

                    {/* Toggle Active Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase border transition cursor-pointer ${
                          c.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.is_active ? 'bg-emerald-400' : 'bg-zinc-500'
                          }`}
                        />
                        {c.is_active ? 'Active' : 'Deactivated'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setCouponToDelete(c)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                        title="Delete Promo Code"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-[#272b3b] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2128]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#e5c158]" />
                Create New Promo Code
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. VIP20 or BROHOOD1000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white font-mono uppercase tracking-wider text-sm focus:outline-none focus:border-[#e5c158]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder={discountType === 'percentage' ? '10' : '500'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1499"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 10% discount on first luxury watch or sneaker purchase"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2128]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] text-black font-bold uppercase"
                >
                  {creating ? 'Saving...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-rose-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white">Delete Coupon Code?</h3>
            <p className="text-xs text-zinc-400 mt-2">
              Are you sure you want to delete promo code{' '}
              <span className="font-bold text-white">{couponToDelete.code}</span>? Customers will no
              longer be able to apply this discount.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCouponToDelete(null)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
