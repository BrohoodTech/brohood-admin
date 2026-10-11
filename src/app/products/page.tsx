'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Filter,
  Flame,
  Star,
  Sparkles,
  Trash2,
  Edit,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch(
          `/api/products?search=${encodeURIComponent(search)}&category=${selectedCategory}&status=${selectedStatus}`
        ),
        fetch('/api/categories'),
      ]);

      if (!prodRes.ok) throw new Error('Failed to load products');
      const prodJson = await prodRes.json();
      setProducts(prodJson || []);

      if (catRes.ok) {
        const catJson = await catRes.json();
        setCategories(catJson || []);
      }
    } catch (err: any) {
      toastError(err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const newStatus = !product.is_active;
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      success(`"${product.title}" is now ${newStatus ? 'Active' : 'Draft / Inactive'}`);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: newStatus } : p))
      );
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete product');
      success(`Product "${productToDelete.title}" and its variants deleted`);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err: any) {
      toastError(err.message || 'Error deleting product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2128] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#e5c158] font-bold">
              CATALOG REPOSITORY
            </span>
            <span className="text-zinc-500 font-mono text-xs">({products.length} Items)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
            Product Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Superclone watches, hyped kicks, designer goggles, and heavyweight apparel drops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14161f] border border-[#232634] hover:bg-[#1a1d29] text-zinc-300 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#e5c158]" />
            <span>Reload</span>
          </button>
          <Link
            href="/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] hover:from-[#fbe294] hover:to-[#edd06f] text-black font-bold text-xs tracking-wider uppercase transition shadow-md shadow-[#e5c158]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title, brand, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-[#e5c158] transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#181a24] text-[11px] font-semibold text-zinc-300 hover:text-white border border-[#2e3347]"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#e5c158]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0a0b0e] border border-[#272b3b] text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#e5c158] transition"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0a0b0e] border border-[#272b3b] text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#e5c158] transition"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="draft">Draft / Inactive</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-[#121318] border border-[#222533] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2128] bg-[#0e0f14] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Brand & Category</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c26]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <div className="w-8 h-8 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading catalog items...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500">
                    <Package className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const discount =
                    product.mrp && product.mrp > product.price
                      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                      : 0;

                  const totalStock = product.total_stock ?? 0;
                  const isLowStock = totalStock <= 3;

                  return (
                    <tr key={product.id} className="hover:bg-[#151722] transition group">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#1c1f2b] border border-[#2b2f42] overflow-hidden shrink-0 relative flex items-center justify-center">
                            {product.primary_image ? (
                              <img
                                src={product.primary_image}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>
                          <div className="max-w-xs">
                            <Link
                              href={`/products/${product.id}`}
                              className="font-bold text-white hover:text-[#e5c158] transition line-clamp-1 text-xs"
                            >
                              {product.title}
                            </Link>
                            <span className="text-[10px] font-mono text-zinc-500 block">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-200 block">
                          {product.brand?.name || 'Generic / Unbranded'}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Pricing & Discount */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">
                            {formatINR(product.price)}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="font-mono text-zinc-500 line-through text-[11px]">
                              {formatINR(product.mrp)}
                            </span>
                          )}
                        </div>
                        {discount > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-400">
                            {discount}% OFF
                          </span>
                        )}
                      </td>

                      {/* Total Stock */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full border ${
                            totalStock === 0
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : isLowStock
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          }`}
                        >
                          {totalStock} in stock
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5">
                          {product.variants?.length || 0} variant(s)
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.is_hot && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase">
                              <Flame className="w-2.5 h-2.5" /> HOT
                            </span>
                          )}
                          {product.is_bestseller && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e5c158]/15 text-[#e5c158] border border-[#e5c158]/30 text-[10px] font-bold uppercase">
                              <Star className="w-2.5 h-2.5" /> Best
                            </span>
                          )}
                          {product.is_new_arrival && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase">
                              <Sparkles className="w-2.5 h-2.5" /> New
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase border transition cursor-pointer ${
                            product.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                          }`}
                          title="Click to toggle status"
                        >
                          {product.is_active ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Active
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                              Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-1.5 rounded-lg bg-[#181a24] hover:bg-[#232738] text-zinc-300 hover:text-[#e5c158] border border-[#2b2f42] transition"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Delete Product Drop?</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-white">"{productToDelete.title}"</span>?
            </p>
            <p className="text-xs text-rose-400/90 mt-2 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              ⚠️ Warning: This will cascade and delete all associated size/color variants and image
              records from the database.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
