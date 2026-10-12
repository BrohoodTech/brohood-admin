'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Flame,
  Star,
  Tag,
  Trash2,
  Edit,
  AlertTriangle,
  RotateCcw,
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
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Products
            </span>
            <span className="text-slate-500 font-mono text-xs">({products.length} Items)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your store catalog, pricing, stock levels, and item visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reload</span>
          </button>
          <Link
            href="/products/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, brand, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-20 py-2 rounded-lg bg-slate-950/40 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-700/60"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950/40 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition"
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
            className="bg-slate-950/40 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="draft">Draft / Inactive</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3.5">Product</th>
                <th className="py-2.5 px-3.5">Category & Brand</th>
                <th className="py-2.5 px-3.5">Price</th>
                <th className="py-2.5 px-3.5">Stock</th>
                <th className="py-2.5 px-3.5">Badges</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
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
                    <tr key={product.id} className="hover:bg-slate-800/40 transition group">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative flex items-center justify-center">
                            {product.primary_image ? (
                              <img
                                src={product.primary_image}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div className="max-w-xs">
                            <Link
                              href={`/products/${product.id}`}
                              className="font-medium text-slate-200 hover:text-indigo-400 transition line-clamp-1 text-xs"
                            >
                              {product.title}
                            </Link>
                            <span className="text-[10px] font-mono text-slate-500 block">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="py-3 px-3.5">
                        <span className="font-medium text-slate-300 block">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {product.brand?.name || 'Generic / Unbranded'}
                        </span>
                      </td>

                      {/* Pricing & Discount */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-medium text-white text-xs">
                            {formatINR(product.price)}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="font-mono text-slate-500 line-through text-[11px]">
                              {formatINR(product.mrp)}
                            </span>
                          )}
                        </div>
                        {discount > 0 && (
                          <span className="text-[10px] font-medium text-emerald-400">
                            {discount}% OFF
                          </span>
                        )}
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-medium text-xs px-2 py-0.5 rounded border ${
                            totalStock === 0
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : isLowStock
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          }`}
                        >
                          {totalStock} in stock
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {product.variants?.length || 0} variant(s)
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-wrap gap-1">
                          {product.is_hot && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-medium uppercase">
                              <Flame className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                          {product.is_bestseller && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-medium uppercase">
                              <Star className="w-2.5 h-2.5" /> Bestseller
                            </span>
                          )}
                          {product.is_new_arrival && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-medium uppercase">
                              <Tag className="w-2.5 h-2.5" /> New
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-3.5">
                        <button
                          onClick={() => handleToggleActive(product)}
                          type="button"
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase border transition cursor-pointer ${
                            product.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700/60 hover:bg-slate-750'
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.is_active ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                          {product.is_active ? 'Active' : 'Draft'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setProductToDelete(product)}
                            type="button"
                            className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3.5">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-white">Delete Product</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">"{productToDelete.title}"</span>?
            </p>
            <p className="text-xs text-rose-400 mt-2.5 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              This action will remove all variants and image records associated with this product.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                disabled={deleting}
                onClick={() => setProductToDelete(null)}
                type="button"
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                type="button"
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Product</span>
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
