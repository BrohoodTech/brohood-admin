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
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Inventory
            </span>
            <span className="text-slate-500 font-mono text-xs">({variants.length} Active SKUs)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Stock & Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time inventory counts, update variant SKUs, and manage low stock alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleBulkRestock(10)}
            disabled={bulkRestocking}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs font-medium transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{bulkRestocking ? 'Restocking...' : 'Restock Low (+10)'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variant</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Variants
          </button>

          <button
            onClick={() => setActiveTab('low')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'low'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400'
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
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'out'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
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
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU or variant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950/40 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
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
            type="button"
            className="p-2 rounded-lg bg-slate-850 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Reload"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Inventory Grid Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3.5">Product</th>
                <th className="py-2.5 px-3.5">Variant</th>
                <th className="py-2.5 px-3.5">Type</th>
                <th className="py-2.5 px-3.5">SKU Code</th>
                <th className="py-2.5 px-3.5">Price</th>
                <th className="py-2.5 px-3.5 text-center">Stock Adjustment</th>
                <th className="py-2.5 px-3.5 text-right">Quick Add</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading inventory items...
                  </td>
                </tr>
              ) : variants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No variant records found matching your filters.
                  </td>
                </tr>
              ) : (
                variants.map((v) => {
                  const isOut = v.stock_quantity === 0;
                  const isLow = v.stock_quantity > 0 && v.stock_quantity <= 3;
                  const prod = v.product;

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition group">
                      {/* Product Reference */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-md bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {prod?.primary_image ? (
                              <img
                                src={prod.primary_image}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div className="max-w-xs">
                            <span className="font-medium text-slate-200 block truncate">
                              {prod?.title || 'Unknown Product'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {prod?.category?.name || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Variant Name */}
                      <td className="py-3 px-3.5">
                        <span className="font-medium text-slate-200 block">{v.name}</span>
                      </td>

                      {/* Variant Type */}
                      <td className="py-3 px-3.5">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          {v.variant_type}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3.5">
                        <span className="font-mono text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                          {v.sku}
                        </span>
                      </td>

                      {/* Price Delta */}
                      <td className="py-3 px-3.5 font-mono">
                        <span className="text-white font-medium">
                          {formatINR((prod?.price || 0) + (v.price_delta || 0))}
                        </span>
                        {v.price_delta !== 0 && (
                          <span className="block text-[10px] text-slate-400">
                            ({v.price_delta > 0 ? `+${formatINR(v.price_delta)}` : formatINR(v.price_delta)})
                          </span>
                        )}
                      </td>

                      {/* Live Inline +/- Stock Control */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => adjustStock(v.id, v.stock_quantity, -1)}
                            disabled={v.stock_quantity <= 0}
                            type="button"
                            className="w-6 h-6 rounded bg-slate-800 border border-slate-700/60 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition disabled:opacity-30 cursor-pointer"
                            title="Decrease Stock (-1)"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={v.stock_quantity}
                            onChange={(e) => handleStockDirectChange(v.id, parseInt(e.target.value) || 0)}
                            className={`w-14 py-1 text-center font-mono font-semibold text-xs rounded-md border bg-slate-950 focus:outline-none transition ${
                              isOut
                                ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                                : isLow
                                ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                                : 'text-slate-100 border-slate-800'
                            }`}
                          />

                          <button
                            onClick={() => adjustStock(v.id, v.stock_quantity, 1)}
                            type="button"
                            className="w-6 h-6 rounded bg-slate-800 border border-slate-700/60 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition cursor-pointer"
                            title="Increase Stock (+1)"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Status Label */}
                        <div className="text-center mt-1">
                          {isOut ? (
                            <span className="text-[10px] font-medium text-rose-400 uppercase tracking-wider">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
                              Low Stock ({v.stock_quantity} left)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">In Stock</span>
                          )}
                        </div>
                      </td>

                      {/* Quick Restock Action */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => adjustStock(v.id, v.stock_quantity, 5)}
                            type="button"
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-slate-750 transition"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => adjustStock(v.id, v.stock_quantity, 10)}
                            type="button"
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[10px] font-medium text-slate-300 hover:text-white hover:bg-slate-750 transition"
                            title="Add 10 units"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Add Variant SKU
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVariant} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800 text-white focus:border-indigo-500"
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
                  <label className="block text-slate-300 font-medium mb-1">Variant Type</label>
                  <select
                    value={newVarType}
                    onChange={(e) => setNewVarType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800 text-white focus:border-indigo-500"
                  >
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                    <option value="edition">Edition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Variant Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. UK 9 or Black Dial"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">SKU Identifier *</label>
                <input
                  type="text"
                  placeholder="e.g. RLX-SUB-BLK-41"
                  value={newVarSku}
                  onChange={(e) => setNewVarSku(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800 font-mono text-slate-200 uppercase focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newVarStock}
                    onChange={(e) => setNewVarStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800 text-white font-semibold focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price Delta (+₹)</label>
                  <input
                    type="number"
                    value={newVarDelta}
                    onChange={(e) => setNewVarDelta(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800 text-white font-mono focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs disabled:opacity-50"
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
