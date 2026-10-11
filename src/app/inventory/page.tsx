'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  Package,
  TrendingUp,
  Tag,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ProductVariant, Category, Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export default function InventoryPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'out'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Modals & Actions
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newVarType, setNewVarType] = useState<'size' | 'color' | 'edition'>('size');
  const [newVarName, setNewVarName] = useState('');
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarStock, setNewVarStock] = useState('10');
  const [newVarDelta, setNewVarDelta] = useState('0');
  const [creating, setCreating] = useState(false);

  const [bulkRestocking, setBulkRestocking] = useState(false);
  const { success, error: toastError, info } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const filterParam = activeTab === 'low' ? '&filter=low' : activeTab === 'out' ? '&filter=out' : '';
      const [varRes, catRes, prodRes] = await Promise.all([
        fetch(
          `/api/inventory?search=${encodeURIComponent(search)}&category=${selectedCategory}${filterParam}`
        ),
        fetch('/api/categories'),
        fetch('/api/products'),
      ]);

      if (!varRes.ok) throw new Error('Failed to load inventory');
      const varData = await varRes.json();
      setVariants(varData || []);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData || []);
      }

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData || []);
        if (prodData.length > 0 && !selectedProductId) {
          setSelectedProductId(prodData[0].id);
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Error fetching inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Inline +/- Stock adjuster
  const adjustStock = async (variantId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    // Optimistic UI update
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, stock_quantity: newStock } : v))
    );

    try {
      const res = await fetch(`/api/inventory/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: newStock }),
      });
      if (!res.ok) throw new Error('Failed to update stock');
    } catch (err: any) {
      toastError('Stock adjustment failed, rolling back.');
      loadData();
    }
  };

  // Direct numeric input update
  const handleStockDirectChange = async (variantId: string, newStock: number) => {
    if (isNaN(newStock) || newStock < 0) return;
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, stock_quantity: newStock } : v))
    );

    try {
      await fetch(`/api/inventory/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: newStock }),
      });
      success('Stock updated');
    } catch {
      toastError('Failed to save stock quantity');
    }
  };

  // Bulk Restock action (+10 units to low stock)
  const handleBulkRestock = async (units: number) => {
    setBulkRestocking(true);
    try {
      const res = await fetch('/api/inventory/bulk-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addQuantity: units }),
      });

      if (!res.ok) throw new Error('Bulk restock failed');
      const data = await res.json();
      success(data.message || `Restocked low variants by +${units} units`);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error executing bulk restock');
    } finally {
      setBulkRestocking(false);
    }
  };

  // Create Variant
  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !newVarName.trim() || !newVarSku.trim()) {
      toastError('Please fill all variant fields');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProductId,
          variant_type: newVarType,
          name: newVarName.trim(),
          sku: newVarSku.trim(),
          stock_quantity: Number(newVarStock) || 0,
          price_delta: Number(newVarDelta) || 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to create variant');
      success(`Variant "${newVarName}" added!`);
      setShowAddModal(false);
      setNewVarName('');
      setNewVarSku('');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error creating variant');
    } finally {
      setCreating(false);
    }
  };

  const lowStockCount = variants.filter((v) => v.stock_quantity <= 3).length;
  const outOfStockCount = variants.filter((v) => v.stock_quantity === 0).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2128] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#e5c158] font-bold">
              LIVE INVENTORY COMMAND
            </span>
            <span className="text-zinc-500 font-mono text-xs">({variants.length} Active SKUs)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Inventory & Variant Manager
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time stock adjustment, SKU management, price deltas, and automated low-stock warnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleBulkRestock(10)}
            disabled={bulkRestocking}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#e5c158] border border-[#e5c158]/30 text-xs font-bold transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{bulkRestocking ? 'Restocking...' : 'Bulk Restock Low (+10)'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] hover:from-[#fbe294] hover:to-[#edd06f] text-black font-bold text-xs tracking-wider uppercase transition shadow-md shadow-[#e5c158]/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Variant</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121318] border border-[#232635] w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-[#1e212d] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Variants
          </button>

          <button
            onClick={() => setActiveTab('low')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'low'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock (≤3)</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-[10px] font-mono">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('out')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'out'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-zinc-400 hover:text-rose-400'
            }`}
          >
            <span>Out of Stock</span>
            {outOfStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-[10px] font-mono">
                {outOfStockCount}
              </span>
            )}
          </button>
        </div>

        {/* Search and Category Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by SKU or variant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#121318] border border-[#232635] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#e5c158]"
            />
          </form>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#121318] border border-[#232635] text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#e5c158]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-[#121318] border border-[#232635] hover:bg-[#181a24] text-zinc-400 hover:text-white"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4 text-[#e5c158]" />
          </button>
        </div>
      </div>

      {/* Inventory Grid Table */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2128] bg-[#0e0f14] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Product Drop</th>
                <th className="py-3.5 px-4">Variant Option</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Price / Delta</th>
                <th className="py-3.5 px-4 text-center">Live Stock Control</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c26]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <div className="w-8 h-8 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching inventory items...
                  </td>
                </tr>
              ) : variants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    No variant records found matching your filters.
                  </td>
                </tr>
              ) : (
                variants.map((v) => {
                  const isOut = v.stock_quantity === 0;
                  const isLow = v.stock_quantity > 0 && v.stock_quantity <= 3;
                  const prod = v.product;

                  return (
                    <tr key={v.id} className="hover:bg-[#151722] transition group">
                      {/* Product Reference */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#1a1d29] border border-[#2b2f42] overflow-hidden shrink-0">
                            {prod?.primary_image ? (
                              <img
                                src={prod.primary_image}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-zinc-600 m-auto mt-3" />
                            )}
                          </div>
                          <div className="max-w-xs">
                            <span className="font-bold text-white block truncate">
                              {prod?.title || 'Unknown Product'}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {prod?.category?.name || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Variant Name */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-zinc-200 block">{v.name}</span>
                      </td>

                      {/* Variant Type */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {v.variant_type}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-[#e5c158] bg-[#e5c158]/10 px-2 py-0.5 rounded border border-[#e5c158]/20">
                          {v.sku}
                        </span>
                      </td>

                      {/* Price Delta */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-white font-bold">
                          {formatINR((prod?.price || 0) + (v.price_delta || 0))}
                        </span>
                        {v.price_delta !== 0 && (
                          <span className="block text-[10px] text-zinc-400">
                            ({v.price_delta > 0 ? `+${formatINR(v.price_delta)}` : formatINR(v.price_delta)})
                          </span>
                        )}
                      </td>

                      {/* Live Inline +/- Stock Control */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => adjustStock(v.id, v.stock_quantity, -1)}
                            disabled={v.stock_quantity <= 0}
                            className="w-7 h-7 rounded-lg bg-[#1b1d28] border border-[#292d3f] hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 flex items-center justify-center text-zinc-300 transition disabled:opacity-30 cursor-pointer"
                            title="Decrease Stock (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={v.stock_quantity}
                            onChange={(e) => handleStockDirectChange(v.id, parseInt(e.target.value) || 0)}
                            className={`w-14 py-1 text-center font-mono font-bold text-xs rounded-lg border bg-[#0a0b0e] focus:outline-none transition ${
                              isOut
                                ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                                : isLow
                                ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                                : 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                            }`}
                          />

                          <button
                            onClick={() => adjustStock(v.id, v.stock_quantity, 1)}
                            className="w-7 h-7 rounded-lg bg-[#1b1d28] border border-[#292d3f] hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center text-zinc-300 transition cursor-pointer"
                            title="Increase Stock (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Status Label */}
                        <div className="text-center mt-1">
                          {isOut ? (
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                              Low Stock ({v.stock_quantity} left)
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-500">In Stock</span>
                          )}
                        </div>
                      </td>

                      {/* Quick Restock Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => adjustStock(v.id, v.stock_quantity, 5)}
                            className="px-2 py-1 rounded bg-[#1b1e2c] border border-[#2b2f44] text-[10px] font-bold text-zinc-300 hover:text-[#e5c158] hover:border-[#e5c158]/40 transition"
                            title="Add 5 units instantly"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => adjustStock(v.id, v.stock_quantity, 10)}
                            className="px-2 py-1 rounded bg-[#1b1e2c] border border-[#2b2f44] text-[10px] font-bold text-zinc-300 hover:text-[#e5c158] hover:border-[#e5c158]/40 transition"
                            title="Add 10 units instantly"
                          >
                            +10
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

      {/* Add New Variant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-[#272b3b] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2128]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#e5c158]" />
                Add Variant SKU to Product
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVariant} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Target Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Variant Type</label>
                  <select
                    value={newVarType}
                    onChange={(e) => setNewVarType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white"
                  >
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                    <option value="edition">Edition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Variant Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. UK 9 or Black Dial"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">SKU Identifier *</label>
                <input
                  type="text"
                  placeholder="e.g. RLX-SUB-BLK-41"
                  value={newVarSku}
                  onChange={(e) => setNewVarSku(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] font-mono text-zinc-300 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newVarStock}
                    onChange={(e) => setNewVarStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Price Delta (+₹)</label>
                  <input
                    type="number"
                    value={newVarDelta}
                    onChange={(e) => setNewVarDelta(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2128]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] text-black font-bold uppercase"
                >
                  {creating ? 'Saving...' : 'Add Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
