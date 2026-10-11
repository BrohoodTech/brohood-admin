'use client';

import React, { useEffect, useState, use } from 'react';
import { ProductForm } from '@/components/products/ProductForm';
import { Product } from '@/lib/types';
import { useToast } from '@/components/common/Toast';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        toastError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-zinc-500 uppercase tracking-widest">Loading Product Details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-zinc-500 mt-2">The product you requested does not exist or has been deleted.</p>
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
