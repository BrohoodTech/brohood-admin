'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Star,
  Layers,
  Image as ImageIcon,
  Check,
  ArrowLeft,
  X,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  Globe,
  Palette,
  Search,
  Share2,
  Tag,
} from 'lucide-react';
import { Product, Category, Brand, ProductVariant, ProductImage } from '@/lib/types';
import { slugify, formatINR } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface ProductFormProps {
  initialData?: Product | null;
  isEdit?: boolean;
}

const SPEC_PRESETS: Record<string, Record<string, string>> = {
  watches: {
    movement: 'Clone Calibre 3235 Automatic',
    case_diameter: '41mm',
    glass: 'Anti-reflective Sapphire Crystal',
    water_resistance: '100m Tested',
    bezel: 'Unidirectional Rotating Ceramic',
  },
  sneakers: {
    upper_material: 'Full-Grain Leather & Premium Suede',
    sole_type: 'Air-Cushioned Rubber Cupsole',
    inclusions: '3 Extra Waxed Laces + OG Special Box',
    fit: 'True to Size',
  },
  tshirts: {
    gsm: '260 GSM Heavyweight Cotton',
    fabric: '100% Combed French Terry Cotton',
    fit_type: 'Oversized Drop-Shoulder Relaxed Fit',
    neckline: 'Thick Ribbed Crewneck',
  },
  goggles: {
    lens_type: 'Polarized Beveled UV400 Gradient',
    frame_material: 'High-Density Acetate & Gold Hardware',
    uv_protection: '100% UV400 Category 3',
    inclusions: 'Luxury Hardcase & Microfiber Cloth',
  },
};

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [brandId, setBrandId] = useState(initialData?.brand_id || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [mrp, setMrp] = useState(initialData?.mrp ? String(initialData.mrp) : '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');

  // Badges
  const [isHot, setIsHot] = useState(initialData?.is_hot ?? false);
  const [isBestseller, setIsBestseller] = useState(initialData?.is_bestseller ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.is_new_arrival ?? true);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  // Dynamic Specs (key-value) - filter out seo so it does not collide
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(() => {
    if (initialData?.specs && typeof initialData.specs === 'object') {
      return Object.entries(initialData.specs)
        .filter(([key]) => key !== 'seo')
        .map(([key, value]) => ({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        }));
    }
    return [
      { key: 'movement', value: 'Clone Calibre 3235 Automatic' },
      { key: 'case_diameter', value: '41mm' },
    ];
  });

  // SEO & Metadata State
  const [metaTitle, setMetaTitle] = useState(() => (initialData?.specs as any)?.seo?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(() => (initialData?.specs as any)?.seo?.meta_description || '');
  const [keywords, setKeywords] = useState(() => (initialData?.specs as any)?.seo?.keywords || '');

  // Images state: array of { image_url, is_primary, sort_order }
  const [images, setImages] = useState<Array<{ image_url: string; is_primary: boolean }>>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map((img) => ({
        image_url: img.image_url,
        is_primary: img.is_primary,
      }));
    }
    if (initialData?.primary_image) {
      return [{ image_url: initialData.primary_image, is_primary: true }];
    }
    return [];
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Variants state (supports 'size' | 'color' | 'dial' | 'edition')
  const [variants, setVariants] = useState<
    Array<{
      id?: string;
      variant_type: 'size' | 'color' | 'dial' | 'edition';
      name: string;
      sku: string;
      stock_quantity: number;
      price_delta: number;
    }>
  >(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      return initialData.variants.map((v) => ({
        id: v.id,
        variant_type: v.variant_type,
        name: v.name,
        sku: v.sku,
        stock_quantity: v.stock_quantity,
        price_delta: v.price_delta,
      }));
    }
    return [];
  });

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Brand Modal State
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);

  // Color x Size Matrix Generator Modal State
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [matrixColors, setMatrixColors] = useState('Onyx Black, Vintage White');
  const [matrixSizes, setMatrixSizes] = useState('S, M, L, XL, XXL');
  const [matrixStock, setMatrixStock] = useState('6');

  // Load Categories & Brands
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/brands'),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData || []);
          if (!categoryId && catData.length > 0) {
            setCategoryId(catData[0].id);
          }
        }

        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setBrands(brandData || []);
        }
      } catch (e) {
        console.error('Error fetching meta:', e);
      }
    }
    loadMeta();
  }, []);

  // Auto-generate slug when title changes (unless editing existing)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  };

  // Apply Preset Specs based on category slug
  const applyCategoryPreset = (categorySlug: string) => {
    const preset = SPEC_PRESETS[categorySlug];
    if (preset) {
      const specList = Object.entries(preset).map(([key, value]) => ({ key, value }));
      setSpecs(specList);
      info(`Applied standard specifications preset for ${categorySlug}`);
    }
  };

  // Apply Variant Presets
  const applyVariantPresets = (type: 'sneakers' | 'tshirts' | 'colors' | 'dials' | 'editions') => {
    const baseSku = (slug || slugify(title || 'DROP')).substring(0, 8).toUpperCase();
    if (type === 'sneakers') {
      const sneakerSizes = ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
      const newVars = sneakerSizes.map((s) => ({
        variant_type: 'size' as const,
        name: s,
        sku: `${baseSku}-${s.replace(/\s+/g, '')}`,
        stock_quantity: 6,
        price_delta: 0,
      }));
      setVariants(newVars);
      info('Loaded UK Footwear size variants');
    } else if (type === 'tshirts') {
      const apparelSizes = ['Size S', 'Size M', 'Size L', 'Size XL', 'Size XXL'];
      const newVars = apparelSizes.map((s) => ({
        variant_type: 'size' as const,
        name: s,
        sku: `${baseSku}-${s.replace(/\s+/g, '')}`,
        stock_quantity: 8,
        price_delta: 0,
      }));
      setVariants(newVars);
      info('Loaded Apparel size variants');
    } else if (type === 'colors') {
      const colors = ['Onyx Black', 'Sail White', 'Washed Charcoal'];
      const newVars = colors.map((c) => ({
        variant_type: 'color' as const,
        name: c,
        sku: `${baseSku}-${c.substring(0, 3).toUpperCase()}`,
        stock_quantity: 5,
        price_delta: 0,
      }));
      setVariants(newVars);
      info('Loaded Colorway variants');
    } else if (type === 'dials') {
      const dials = ['Tiffany Blue Dial', 'Emerald Green Dial', 'Onyx Black Dial', 'Ice Blue Arabic Dial'];
      const newVars = dials.map((d) => ({
        variant_type: 'dial' as const,
        name: d,
        sku: `${baseSku}-${d.substring(0, 3).toUpperCase()}`,
        stock_quantity: 4,
        price_delta: 0,
      }));
      setVariants(newVars);
      info('Loaded Watch Dial variants');
    } else if (type === 'editions') {
      const editions = [
        { name: 'Watch Only (Pouch)', price_delta: 0, stock: 10 },
        { name: 'Complete Swiss Clone Box Set + Papers', price_delta: 1500, stock: 4 },
      ];
      const newVars = editions.map((ed, idx) => ({
        variant_type: 'edition' as const,
        name: ed.name,
        sku: `${baseSku}-ED${idx + 1}`,
        stock_quantity: ed.stock,
        price_delta: ed.price_delta,
      }));
      setVariants(newVars);
      info('Loaded Packaging & Edition variants');
    }
  };

  // Color x Size Combination Matrix Generator
  const handleGenerateMatrix = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const colors = matrixColors.split(',').map((c) => c.trim()).filter(Boolean);
    const sizes = matrixSizes.split(',').map((s) => s.trim()).filter(Boolean);
    const stock = Number(matrixStock) || 5;

    if (colors.length === 0 || sizes.length === 0) {
      toastError('Please enter at least one color and one size');
      return;
    }

    const baseSku = (slug || slugify(title || 'DROP')).substring(0, 6).toUpperCase();
    const newVars: typeof variants = [];

    colors.forEach((col) => {
      sizes.forEach((sz) => {
        const colClean = col.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
        const szClean = sz.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        newVars.push({
          variant_type: 'size',
          name: `${col} / ${sz}`,
          sku: `${baseSku}-${colClean}-${szClean}`,
          stock_quantity: stock,
          price_delta: 0,
        });
      });
    });

    setVariants(newVars);
    setShowMatrixModal(false);
    success(`Generated ${newVars.length} Color × Size combination variants with stock!`);
  };

  // Cloudinary / File Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Failed to upload image');
        const data = await res.json();
        if (data.url) {
          setImages((prev) => [
            ...prev,
            { image_url: data.url, is_primary: prev.length === 0 },
          ]);
        }
      }
      success('Image(s) uploaded successfully');
    } catch (err: any) {
      toastError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddDirectImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      { image_url: imageUrlInput.trim(), is_primary: prev.length === 0 },
    ]);
    setImageUrlInput('');
    success('Image URL attached');
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  // Variant Row Helpers
  const addVariantRow = () => {
    const baseSku = (slug || slugify(title || 'SKU')).substring(0, 8).toUpperCase();
    setVariants((prev) => [
      ...prev,
      {
        variant_type: 'size',
        name: `Option ${prev.length + 1}`,
        sku: `${baseSku}-V${prev.length + 1}`,
        stock_quantity: 5,
        price_delta: 0,
      },
    ]);
  };

  const removeVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Spec Row Helpers
  const addSpecRow = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Quick Category Creator
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create category');
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
      setCategoryId(cat.id);
      applyCategoryPreset(cat.slug);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowCategoryModal(false);
      success(`Category "${cat.name}" created and selected!`);
    } catch (err: any) {
      toastError(err.message || 'Error creating category');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Quick Brand Creator
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setCreatingBrand(true);
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBrandName.trim(),
          category_id: categoryId || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create brand');
      const brand = await res.json();
      setBrands((prev) => [...prev, brand]);
      setBrandId(brand.id);
      setNewBrandName('');
      setShowBrandModal(false);
      success(`Brand "${brand.name}" created and selected!`);
    } catch (err: any) {
      toastError(err.message || 'Error creating brand');
    } finally {
      setCreatingBrand(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Product title is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      toastError('A valid selling price is required');
      return;
    }

    setLoading(true);

    try {
      // Format specs object from array
      const specsObject: Record<string, any> = {};
      specs.forEach((s) => {
        if (s.key.trim() && s.value.trim()) {
          specsObject[s.key.trim()] = s.value.trim();
        }
      });

      const primaryImg = images.find((i) => i.is_primary)?.image_url || images[0]?.image_url || null;

      // Attach SEO & Search Discovery metadata inside specs.seo
      specsObject.seo = {
        meta_title: metaTitle.trim() || title.trim(),
        meta_description: metaDescription.trim() || description.slice(0, 160).trim(),
        keywords: keywords.trim(),
        og_image: primaryImg || '',
      };

      const payload = {
        title,
        slug,
        brand_id: brandId || null,
        category_id: categoryId || null,
        description,
        specs: specsObject,
        mrp: Number(mrp) || Number(price),
        price: Number(price),
        primary_image: primaryImg,
        is_hot: isHot,
        is_bestseller: isBestseller,
        is_new_arrival: isNewArrival,
        is_active: isActive,
        variants,
        images,
      };

      const url = isEdit ? `/api/products/${initialData?.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      success(isEdit ? 'Product drop updated successfully!' : 'New product drop published!');
      router.push('/products');
      router.refresh();
    } catch (err: any) {
      toastError(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const calculatedDiscount =
    mrp && price && Number(mrp) > Number(price)
      ? Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)
      : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-[#1f2128] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="p-2 rounded-xl bg-[#14161f] border border-[#232634] text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#e5c158] font-bold">
              {isEdit ? 'PRODUCT MODIFICATION' : 'NEW LUXURY DROP'}
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isEdit ? `Edit: ${initialData?.title}` : 'Create New Product Drop'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] hover:from-[#fbe294] hover:to-[#edd06f] text-black font-bold text-xs tracking-wider uppercase transition shadow-lg shadow-[#e5c158]/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info, Specs, Variants, Images */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1: Core Details */}
          <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#e5c158] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e5c158]" />
              Core Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Rolex Submariner Date 41mm 'Hulk' Green Dial"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#e5c158] transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="auto-generated-slug"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-zinc-300 text-xs font-mono focus:outline-none focus:border-[#e5c158] transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-[11px] text-[#e5c158] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>+ Create Category</span>
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    const selected = categories.find((c) => c.id === e.target.value);
                    if (selected) applyCategoryPreset(selected.slug);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs focus:outline-none focus:border-[#e5c158] transition"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">Brand</label>
                <button
                  type="button"
                  onClick={() => setShowBrandModal(true)}
                  className="text-[11px] text-[#e5c158] hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ Create Brand</span>
                </button>
              </div>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs focus:outline-none focus:border-[#e5c158] transition"
              >
                <option value="">Select Brand (Optional)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Detailed Product Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention 1:1 superclone craftsmanship, materials, movement calibre, inclusions, etc."
                className="w-full px-4 py-3 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-[#e5c158] transition"
              />
            </div>
          </div>

          {/* Card 2: Cloudinary & Media Gallery */}
          <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#e5c158] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#e5c158]" />
                  Media Gallery & Cloudinary Uploader
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  High-resolution product visuals. First or highlighted image acts as primary thumbnail.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-500">{images.length} Image(s)</span>
            </div>

            {/* Upload Box & Direct URL bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="border-2 border-dashed border-[#2b2f42] hover:border-[#e5c158]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#0a0b0e]/60 transition group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <div className="w-10 h-10 rounded-xl bg-[#161824] flex items-center justify-center text-[#e5c158] group-hover:scale-110 transition mb-2">
                  {uploadingImage ? (
                    <div className="w-5 h-5 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-200 group-hover:text-white">
                  {uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Photos'}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
              </label>

              {/* Direct Image URL input */}
              <div className="p-4 rounded-2xl bg-[#0a0b0e] border border-[#232635] flex flex-col justify-between">
                <span className="text-xs font-semibold text-zinc-300">Direct CDN / Web Image URL</span>
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#141620] border border-[#282c3d] text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-[#e5c158]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDirectImageUrl}
                    className="px-3 py-2 rounded-xl bg-[#1b1e2c] text-[#e5c158] font-semibold text-xs border border-[#2d3248] hover:bg-[#23273a] transition"
                  >
                    Attach
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1">
                  Cloudinary, Unsplash, or CDN direct links
                </span>
              </div>
            </div>

            {/* Uploaded Images List */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#1f2128]">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border group bg-[#0a0b0e] aspect-square flex items-center justify-center ${
                      img.is_primary
                        ? 'border-[#e5c158] ring-2 ring-[#e5c158]/30'
                        : 'border-[#232635]'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`Product preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className={`text-[10px] font-bold py-1 px-2 rounded-lg transition ${
                          img.is_primary
                            ? 'bg-[#e5c158] text-black'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-[#e5c158] hover:text-black'
                        }`}
                      >
                        {img.is_primary ? 'Primary Thumbnail' : 'Set as Primary'}
                      </button>
                    </div>

                    {img.is_primary && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#e5c158] text-black font-extrabold text-[9px] uppercase shadow">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Variants & Stock Levels */}
          <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#e5c158] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#e5c158]" />
                  Inventory Variants (Sizes, Colors & Editions)
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage individual SKUs, stock allocations, and custom price adjustments.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Load Presets:</span>
                <button
                  type="button"
                  onClick={() => applyVariantPresets('dials')}
                  className="px-2.5 py-1 rounded-lg bg-[#181a24] border border-[#282c3d] text-[11px] text-zinc-300 hover:text-[#e5c158] cursor-pointer"
                >
                  Watch Dials
                </button>
                <button
                  type="button"
                  onClick={() => applyVariantPresets('editions')}
                  className="px-2.5 py-1 rounded-lg bg-[#181a24] border border-[#282c3d] text-[11px] text-zinc-300 hover:text-[#e5c158] cursor-pointer"
                >
                  Box Sets
                </button>
                <button
                  type="button"
                  onClick={() => applyVariantPresets('tshirts')}
                  className="px-2.5 py-1 rounded-lg bg-[#181a24] border border-[#282c3d] text-[11px] text-zinc-300 hover:text-[#e5c158] cursor-pointer"
                >
                  Apparel Sizes
                </button>
                <button
                  type="button"
                  onClick={() => applyVariantPresets('sneakers')}
                  className="px-2.5 py-1 rounded-lg bg-[#181a24] border border-[#282c3d] text-[11px] text-zinc-300 hover:text-[#e5c158] cursor-pointer"
                >
                  Sneaker Sizes
                </button>
                <button
                  type="button"
                  onClick={() => applyVariantPresets('colors')}
                  className="px-2.5 py-1 rounded-lg bg-[#181a24] border border-[#282c3d] text-[11px] text-zinc-300 hover:text-[#e5c158] cursor-pointer"
                >
                  Colors
                </button>
                <button
                  type="button"
                  onClick={() => setShowMatrixModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-400 hover:bg-sky-500/20 cursor-pointer flex items-center gap-1"
                >
                  <Palette className="w-3 h-3" />
                  <span>Color × Size Matrix</span>
                </button>
              </div>
            </div>

            {/* Variants Table */}
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl bg-[#0a0b0e] border border-[#232635] items-center"
                >
                  <div className="sm:col-span-2">
                    <select
                      value={v.variant_type}
                      onChange={(e) => {
                        const val = e.target.value as 'size' | 'color' | 'dial' | 'edition';
                        setVariants((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, variant_type: val } : item))
                        );
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-[#141620] border border-[#2b2f42] text-xs text-zinc-300 capitalize"
                    >
                      <option value="size">Size</option>
                      <option value="color">Color</option>
                      <option value="dial">Dial Color</option>
                      <option value="edition">Edition / Box</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Variant Name (e.g. UK 9)"
                      value={v.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                        );
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#141620] border border-[#2b2f42] text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="SKU"
                      value={v.sku}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                        );
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#141620] border border-[#2b2f42] text-xs font-mono text-zinc-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase">Stock:</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock_quantity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, stock_quantity: val } : item
                            )
                          );
                        }}
                        className="w-full px-2 py-2 rounded-lg bg-[#141620] border border-[#2b2f42] text-xs text-center font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-[10px] text-zinc-500 uppercase">+₹:</span>
                      <input
                        type="number"
                        value={v.price_delta}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVariants((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, price_delta: val } : item
                            )
                          );
                        }}
                        className="w-full px-2 py-2 rounded-lg bg-[#141620] border border-[#2b2f42] text-xs text-center font-mono text-zinc-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariantRow(idx)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                      title="Remove Variant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addVariantRow}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171924] border border-[#282c3f] text-xs font-semibold text-[#e5c158] hover:bg-[#202334] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Variant</span>
            </button>
          </div>

          {/* Card 4: Dynamic JSONB Specifications */}
          <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#e5c158]">
                  Technical Specifications (JSONB)
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Attributes rendered on product pages (Movement, Glass, Fabric, UV protection).
                </p>
              </div>
              <button
                type="button"
                onClick={addSpecRow}
                className="flex items-center gap-1 text-xs text-[#e5c158] hover:underline"
              >
                <Plus className="w-3 h-3" />
                <span>Add Spec Key</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Key (e.g. movement, gsm)"
                    value={s.key}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpecs((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, key: val } : item))
                      );
                    }}
                    className="w-1/3 px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#e5c158]"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Clone Calibre 3235, 260 GSM)"
                    value={s.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSpecs((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                      );
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-xs text-white focus:outline-none focus:border-[#e5c158]"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(idx)}
                    className="p-2 text-zinc-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: SEO & Search Discovery Metadata */}
          <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#e5c158] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#e5c158]" />
                  SEO & Search Discovery (Google & Social Previews)
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Metadata consumed by Google search crawlers, social cards, and buyer link previews.
                </p>
              </div>
              <span className="text-xs font-mono text-[#e5c158] bg-[#e5c158]/10 px-2.5 py-1 rounded-full border border-[#e5c158]/20">
                SEO Ready
              </span>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="p-4 rounded-xl bg-[#0a0b0e] border border-[#232635] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Google Search Snippet Preview
              </span>
              <div className="text-sky-400 text-sm font-semibold hover:underline truncate">
                {metaTitle.trim() || title.trim() || 'Rolex Submariner Hulk 41mm'} | BroHood Luxury
              </div>
              <div className="text-emerald-500 text-xs font-mono truncate">
                https://brohood.in/products/{slug || 'rolex-submariner-hulk'}
              </div>
              <p className="text-zinc-400 text-xs line-clamp-2">
                {metaDescription.trim() ||
                  description.slice(0, 160).trim() ||
                  'Shop 1:1 Master Quality luxury drops with authentic weight, clones, and express India delivery.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    SEO Meta Title
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      metaTitle.length > 60 ? 'text-amber-400' : 'text-zinc-500'
                    }`}
                  >
                    {metaTitle.length} / 60 chars (Recommended)
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Defaults to product title if left blank..."
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-[#e5c158]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Meta Description
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      metaDescription.length > 160 ? 'text-amber-400' : 'text-zinc-500'
                    }`}
                  >
                    {metaDescription.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Compelling 150-160 character description shown on search engine results..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-[#e5c158]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Focus Keywords / Search Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. rolex clone, superclone watch, hulk submariner, 1:1 master copy"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-[#e5c158]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Pricing, Merchandising Flags, Live Preview */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#e5c158]">
              Pricing & Discounts
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Selling Price (INR ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="11999"
                  required
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white font-mono text-base font-bold focus:outline-none focus:border-[#e5c158] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Original MRP (Strikethrough)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="18500"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-zinc-400 font-mono text-sm focus:outline-none focus:border-[#e5c158] transition"
                />
              </div>
            </div>

            {calculatedDiscount > 0 && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">Customer Savings:</span>
                <span className="font-bold text-emerald-300 font-mono">
                  {calculatedDiscount}% OFF (Save {formatINR(Number(mrp) - Number(price))})
                </span>
              </div>
            )}
          </div>

          {/* Merchandising Toggles Card */}
          <div className="bg-[#121318] border border-[#222533] rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#e5c158]">
              Merchandising Badges
            </h2>

            <div className="space-y-3">
              {/* Active Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0a0b0e] border border-[#232635] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Active on Storefront</span>
                  <span className="text-[11px] text-zinc-400">Publicly visible for purchase</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#e5c158] cursor-pointer"
                />
              </label>

              {/* Hot Drop Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0a0b0e] border border-[#232635] cursor-pointer">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">HOT Drop Badge</span>
                    <span className="text-[11px] text-zinc-400">Featured in hype banners</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isHot}
                  onChange={(e) => setIsHot(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </label>

              {/* Bestseller Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0a0b0e] border border-[#232635] cursor-pointer">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#e5c158]" />
                  <div>
                    <span className="text-xs font-bold text-white block">Bestseller Pill</span>
                    <span className="text-[11px] text-zinc-400">Top-rated recommended</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="w-4 h-4 accent-[#e5c158] cursor-pointer"
                />
              </label>

              {/* New Arrival Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0a0b0e] border border-[#232635] cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">New Arrival</span>
                    <span className="text-[11px] text-zinc-400">Included in recent drops</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 accent-sky-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Brand Creation Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-[#272b3b] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2128]">
              <h3 className="text-sm font-bold text-white">Create New Brand</h3>
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Brand Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chrome Hearts, Audemars Piguet"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs focus:outline-none focus:border-[#e5c158]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2128]">
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBrand}
                disabled={creatingBrand || !newBrandName.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] text-black font-bold text-xs uppercase"
              >
                {creatingBrand ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-[#272b3b] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2128]">
              <h3 className="text-sm font-bold text-white">Create New Category</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Watches, Perfumes, Belts"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs focus:outline-none focus:border-[#e5c158]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of this product collection..."
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs focus:outline-none focus:border-[#e5c158]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2128]">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] text-black font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
              >
                {creatingCategory ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color x Size Combination Matrix Modal */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121318] border border-[#272b3b] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2128]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#e5c158]" />
                  Color × Size Matrix Generator
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Auto-generates individual SKUs & stock for all color-size combinations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Colors (Comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Onyx Black, Vintage White, Olive Green"
                  value={matrixColors}
                  onChange={(e) => setMatrixColors(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs focus:outline-none focus:border-[#e5c158]"
                />
                <span className="text-[10px] text-zinc-500">
                  Example: Onyx Black, Sail White, Charcoal
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Sizes (Comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL, XXL (or UK 7, UK 8, UK 9)"
                  value={matrixSizes}
                  onChange={(e) => setMatrixSizes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs focus:outline-none focus:border-[#e5c158]"
                />
                <span className="text-[10px] text-zinc-500">
                  Example: S, M, L, XL, XXL
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Default Stock per Combination
                </label>
                <input
                  type="number"
                  min="0"
                  value={matrixStock}
                  onChange={(e) => setMatrixStock(e.target.value)}
                  className="w-32 px-3 py-2 rounded-xl bg-[#0a0b0e] border border-[#272b3b] text-white text-xs font-bold focus:outline-none focus:border-[#e5c158]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2128]">
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateMatrix}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#f5d376] to-[#e5c158] text-black font-bold text-xs uppercase cursor-pointer"
              >
                Generate Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
