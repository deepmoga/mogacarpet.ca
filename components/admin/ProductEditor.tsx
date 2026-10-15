'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Trash2,
  ExternalLink,
  Upload,
  Plus,
  X,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  Layers,
  Palette,
  Package,
  Settings2,
  FileText,
  DollarSign,
  Tag,
  ImageIcon,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Search,
  Folder,
  FolderTree
} from 'lucide-react';
import { CATEGORIES, getFlattenedCategories } from '@/data/categories';

export interface Variation {
  name: string;
  color_code: string;
  image?: string;
  sku?: string;
  price?: string;
}

export interface SpecItem {
  key: string;
  value: string;
}

interface ProductEditorProps {
  mode: 'create' | 'edit';
  productId?: string;
  initialProduct?: any;
}

const COLOR_PRESETS = [
  { name: 'Pitch Black', code: '#1a1a1a' },
  { name: 'Pure White', code: '#ffffff' },
  { name: 'Slate Grey', code: '#757575' },
  { name: 'Charcoal', code: '#36454f' },
  { name: 'Royal Blue', code: '#1212ff' },
  { name: 'Navy Blue', code: '#0a192f' },
  { name: 'Crimson Red', code: '#ff0000' },
  { name: 'Warm Beige', code: '#d7c4b7' },
  { name: 'Golden Oak', code: '#d4af37' },
  { name: 'Espresso Brown', code: '#4a2c11' },
  { name: 'Forest Green', code: '#2e7d32' },
  { name: 'Burgundy', code: '#800020' },
];

const UNIT_OPTIONS = [
  'sq. yd.',
  'sq. ft.',
  'rug (5x8)',
  'rug (8x10)',
  'runner (2.5x10)',
  'box (20 sq ft)',
  'roll',
  'linear ft.',
  'piece',
];

const BADGE_PRESETS = [
  'Best Seller',
  '100% Waterproof',
  'Hot Seller',
  'Popular',
  'Fluorescent Glow',
  'Clearance',
  'Hand Crafted',
  'Quick Ship',
  'Modular 20x20',
  'Direct Mill Certified',
];

export default function ProductEditor({ mode, productId, initialProduct }: ProductEditorProps) {
  const router = useRouter();

  // Basic Product Fields
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [price, setPrice] = useState(initialProduct?.price !== undefined ? String(initialProduct.price) : '');
  const [regularPrice, setRegularPrice] = useState(initialProduct?.regular_price !== undefined && initialProduct?.regular_price !== null ? String(initialProduct.regular_price) : '');
  const [salePrice, setSalePrice] = useState(initialProduct?.sale_price !== undefined && initialProduct?.sale_price !== null ? String(initialProduct.sale_price) : '');
  const [unit, setUnit] = useState(initialProduct?.unit || 'sq. yd.');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || 'carpets');
  const [categoryLabel, setCategoryLabel] = useState(initialProduct?.category_label || 'Carpets & Broadloom');
  const [badge, setBadge] = useState(initialProduct?.badge || '');

  // Status & Visibility
  const [inStock, setInStock] = useState<boolean>(initialProduct ? Boolean(initialProduct.in_stock) : true);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct ? Boolean(initialProduct.is_featured) : false);
  const [isVisible, setIsVisible] = useState<boolean>(initialProduct ? Boolean(initialProduct.is_visible !== 0) : true);

  // Descriptions
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || '');

  // Media
  const [image, setImage] = useState(initialProduct?.image || '/images/slide01.jpg');
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (!initialProduct?.gallery_images) return [];
    try {
      return typeof initialProduct.gallery_images === 'string'
        ? JSON.parse(initialProduct.gallery_images)
        : initialProduct.gallery_images;
    } catch {
      return [];
    }
  });

  // Variations / Colors
  const [colors, setColors] = useState<Variation[]>(() => {
    if (!initialProduct?.colors) return [];
    try {
      const parsed = typeof initialProduct.colors === 'string'
        ? JSON.parse(initialProduct.colors)
        : initialProduct.colors;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Specs & Attributes
  const [material, setMaterial] = useState('');
  const [backing, setBacking] = useState('');
  const [trafficRating, setTrafficRating] = useState('');
  const [origin, setOrigin] = useState('');
  const [customSpecs, setCustomSpecs] = useState<SpecItem[]>([]);

  // Features Bullet Points
  const [features, setFeatures] = useState<string[]>(() => {
    if (!initialProduct?.features) return [];
    try {
      const parsed = typeof initialProduct.features === 'string'
        ? JSON.parse(initialProduct.features)
        : initialProduct.features;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [newFeatureText, setNewFeatureText] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'general' | 'inventory' | 'variations' | 'specs' | 'features'>('general');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVariationIdx, setUploadingVariationIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const variationInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize specs from initialProduct
  useEffect(() => {
    if (initialProduct?.specs) {
      try {
        const s = typeof initialProduct.specs === 'string' ? JSON.parse(initialProduct.specs) : initialProduct.specs;
        if (s) {
          if (s.material) setMaterial(s.material);
          if (s.backing) setBacking(s.backing);
          if (s.trafficRating) setTrafficRating(s.trafficRating);
          if (s.origin) setOrigin(s.origin);

          const extra: SpecItem[] = [];
          for (const [k, v] of Object.entries(s)) {
            if (!['material', 'backing', 'trafficRating', 'origin'].includes(k) && typeof v === 'string') {
              extra.push({ key: k, value: v });
            }
          }
          setCustomSpecs(extra);
        }
      } catch {
        // ignore
      }
    }
  }, [initialProduct]);

  // Category tree UI states
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [expandedRoots, setExpandedRoots] = useState<Record<string, boolean>>({
    'carpets': true,
    'area-rugs': true,
    'vinyl-flooring': true,
    'solid-hardwood': true,
    'stair-runner': true,
    'tiles': true,
    'countertop': true,
    'underpad': true
  });
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});

  const toggleRoot = (id: string) => {
    setExpandedRoots(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleSub = (id: string) => {
    setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Select category, subcategory, or sub-subcategory
  const handleSelectCategory = (rootId: string, fullPath: string) => {
    setCategoryId(rootId);
    setCategoryLabel(fullPath);
    // Auto-suggest unit
    if (rootId === 'carpets') setUnit('sq. yd.');
    else if (['vinyl-flooring', 'carpet-tiles', 'solid-hardwood', 'tiles'].includes(rootId)) setUnit('sq. ft.');
    else if (rootId === 'area-rugs') setUnit('rug (5x8)');
    else if (rootId === 'stair-runner') setUnit('runner (2.5x10)');
  };

  // Auto-slug generator on create
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (mode === 'create') {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  };

  // Upload featured image
  const handleUploadFeatured = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setImage(data.url);
        showNotification('success', 'Featured image uploaded successfully!');
      } else {
        showNotification('error', data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload gallery images
  const handleUploadGallery = async (files: FileList) => {
    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        }
      }
      setGalleryImages(prev => [...prev, ...uploadedUrls]);
      showNotification('success', `Added ${uploadedUrls.length} image(s) to gallery!`);
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  // Upload variation image
  const handleUploadVariationImage = async (file: File, index: number) => {
    setUploadingVariationIdx(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setColors(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], image: data.url };
          return updated;
        });
        showNotification('success', `Uploaded image for variation "${colors[index]?.name || index + 1}"!`);
      } else {
        showNotification('error', data.error || 'Failed to upload variation image');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setUploadingVariationIdx(null);
    }
  };

  // Variations actions
  const addVariation = () => {
    setColors(prev => [
      ...prev,
      {
        name: `Color ${prev.length + 1}`,
        color_code: '#1212ff',
        image: image || '',
        sku: sku ? `${sku}-${prev.length + 1}` : '',
        price: '',
      }
    ]);
  };

  const updateVariation = (index: number, field: keyof Variation, value: string) => {
    setColors(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeVariation = (index: number) => {
    setColors(prev => prev.filter((_, idx) => idx !== index));
  };

  // Features actions
  const addFeature = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setFeatures(prev => [...prev, trimmed]);
    setNewFeatureText('');
  };

  const removeFeature = (idx: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  // Custom Specs actions
  const addCustomSpec = () => {
    setCustomSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  const updateCustomSpec = (idx: number, field: 'key' | 'value', value: string) => {
    setCustomSpecs(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const removeCustomSpec = (idx: number) => {
    setCustomSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  // Notification helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Save product
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showNotification('error', 'Product name is required.');
      return;
    }

    setSaving(true);

    // Build specs object
    const finalSpecs: any = {};
    if (material.trim()) finalSpecs.material = material.trim();
    if (backing.trim()) finalSpecs.backing = backing.trim();
    if (trafficRating.trim()) finalSpecs.trafficRating = trafficRating.trim();
    if (origin.trim()) finalSpecs.origin = origin.trim();
    for (const item of customSpecs) {
      if (item.key.trim() && item.value.trim()) {
        finalSpecs[item.key.trim()] = item.value.trim();
      }
    }

    const payload = {
      id: productId,
      name: name.trim(),
      slug: slug.trim() || undefined,
      sku: sku.trim() || null,
      price: parseFloat(price) || 0.00,
      regular_price: regularPrice ? parseFloat(regularPrice) : null,
      sale_price: salePrice ? parseFloat(salePrice) : null,
      unit: unit || 'sq. yd.',
      category_id: categoryId,
      category_label: categoryLabel,
      badge: badge.trim() || null,
      in_stock: inStock ? 1 : 0,
      is_featured: isFeatured ? 1 : 0,
      is_visible: isVisible ? 1 : 0,
      image: image || '/images/slide01.jpg',
      gallery_images: galleryImages,
      colors: colors,
      description: description,
      short_description: shortDescription,
      specs: finalSpecs,
      features: features,
    };

    try {
      const endpoint = mode === 'create' ? '/api/products' : `/api/products/${productId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showNotification('success', mode === 'create' ? 'Product created successfully!' : 'Product updated successfully!');
        if (mode === 'create' && data.id) {
          setTimeout(() => {
            router.push(`/mogacarpetaccess/products/${data.id}`);
          }, 1200);
        }
      } else {
        showNotification('error', data.error || 'Failed to save product');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!productId) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Product deleted successfully.');
        router.push('/mogacarpetaccess?tab=products');
      } else {
        showNotification('error', data.error || 'Failed to delete product');
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-stone-900 pb-24">
      
      {/* WORDPRESS TOP ADMIN BAR */}
      <header className="sticky top-0 z-40 bg-[#0b1026] text-white border-b border-[#182046] shadow-md px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/mogacarpetaccess?tab=products"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </Link>

            <span className="text-stone-500 hidden sm:inline">/</span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4d4dff]">
                {mode === 'create' ? 'Add New Product' : 'Edit Product'}
              </span>
              {mode === 'edit' && productId && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                  ID: {productId}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {mode === 'edit' && productId && (
              <a
                href={`/product/${productId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700"
              >
                <Eye className="w-3.5 h-3.5 text-[#1212ff]" />
                <span className="hidden sm:inline">View Product Live</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            )}

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-red-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{mode === 'create' ? 'Publish Product' : 'Update Product'}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
          <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}>
            <div className="flex items-center gap-2 text-sm font-bold">
              {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORDPRESS LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT MAIN CONTENT (8 COLS) ================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Title & Permalink Meta Box */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Product Title <span className="text-[#ff0000]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Fort Wood Commercial Carpet – Joy Carpets"
                  className="w-full text-xl sm:text-2xl font-extrabold text-stone-900 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1212ff] focus:ring-2 focus:ring-[#1212ff]/20"
                  required
                />
              </div>

              {/* Permalink Display & Edit */}
              <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                <span className="font-semibold text-stone-700">Permalink:</span>
                <span className="text-stone-400 truncate">https://mogacarpet.ca/product/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="product-url-slug"
                  className="flex-1 max-w-sm px-2.5 py-1 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#1212ff]"
                />
              </div>
            </div>

            {/* 2. Long Description Box */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#1212ff]" />
                  <span>Product Description (Main Content)</span>
                </label>
                <span className="text-[11px] text-stone-400">Supports multi-paragraph text</span>
              </div>
              <textarea
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write an in-depth description about construction, performance, ideal room applications, commercial wear warranty, etc..."
                className="w-full text-sm text-stone-800 border border-stone-300 rounded-xl p-4 focus:outline-none focus:border-[#1212ff] focus:ring-2 focus:ring-[#1212ff]/20 font-sans leading-relaxed"
              />
            </div>

            {/* 3. WOOCOMMERCE-STYLE PRODUCT DATA META BOX */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              
              {/* Product Data Header Bar */}
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#1212ff]" />
                  <h3 className="font-extrabold text-stone-900 text-sm">Product Data</h3>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-stone-600 bg-white border border-stone-200 px-3 py-1 rounded-lg">
                  <span>Type:</span>
                  <span className="text-[#1212ff]">Variable / Configurable Flooring</span>
                </div>
              </div>

              {/* Tab Navigation & Panel Container */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
                
                {/* Vertical Tabs Sidebar */}
                <div className="md:col-span-3 border-r border-stone-200 bg-stone-50/70 p-2 space-y-1">
                  {[
                    { id: 'general', label: 'General & Pricing', icon: DollarSign },
                    { id: 'inventory', label: 'Inventory & SKU', icon: Package },
                    { id: 'variations', label: 'Variations & Colors', icon: Palette, badge: colors.length > 0 ? colors.length : null },
                    { id: 'specs', label: 'Specifications', icon: Settings2 },
                    { id: 'features', label: 'Key Features', icon: Sparkles, badge: features.length > 0 ? features.length : null },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-[#1212ff] text-white shadow-md'
                            : 'text-stone-700 hover:bg-stone-200/70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? 'bg-white text-[#1212ff]' : 'bg-blue-100 text-[#1212ff]'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Panel Content */}
                <div className="md:col-span-9 p-6">
                  
                  {/* TAB 1: GENERAL & PRICING */}
                  {activeTab === 'general' && (
                    <div className="space-y-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
                        Pricing & Unit Configuration
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Regular Price ($ CAD) <span className="text-[#ff0000]">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={regularPrice || price}
                              onChange={(e) => {
                                setRegularPrice(e.target.value);
                                if (!salePrice) setPrice(e.target.value);
                              }}
                              placeholder="0.00"
                              className="w-full pl-8 pr-3 py-2.5 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:border-[#1212ff]"
                              required
                            />
                          </div>
                          <span className="text-[10px] text-stone-400 mt-1 block">Base or MSRP wholesale list rate</span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Sale Price ($ CAD)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={salePrice}
                              onChange={(e) => {
                                setSalePrice(e.target.value);
                                if (e.target.value) setPrice(e.target.value);
                                else setPrice(regularPrice);
                              }}
                              placeholder="Optional promo price"
                              className="w-full pl-8 pr-3 py-2.5 border border-stone-300 rounded-xl text-sm font-bold text-[#ff0000] focus:outline-none focus:border-[#ff0000]"
                            />
                          </div>
                          <span className="text-[10px] text-stone-400 mt-1 block">When set, displays a "SAVE %" badge</span>
                        </div>
                      </div>

                      {/* Effective Price Summary */}
                      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-stone-600 block">Current Selling Price:</span>
                          <span className="text-xl font-black text-[#1212ff]">
                            ${price ? parseFloat(price).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-[#1212ff]">
                          Active Checkout Rate
                        </span>
                      </div>

                      {/* Unit of Measure */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          Unit of Measure
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {UNIT_OPTIONS.map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setUnit(u)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                unit === u
                                  ? 'bg-[#1212ff] text-white border-[#1212ff]'
                                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="Or type custom unit (e.g. sq. yd., box, rug)"
                          className="w-full sm:w-64 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#1212ff]"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: INVENTORY & SKU */}
                  {activeTab === 'inventory' && (
                    <div className="space-y-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
                        Inventory & Stock Management
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          SKU (Stock Keeping Unit)
                        </label>
                        <input
                          type="text"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="e.g. JYC-FORT-01"
                          className="w-full sm:w-72 px-3 py-2.5 border border-stone-300 rounded-xl text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-[#1212ff]"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-bold text-stone-700 mb-2">
                          Stock Availability Status
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setInStock(true)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              inStock
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>In Stock (Available for GTA Delivery)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInStock(false)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                              !inStock
                                ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm ring-2 ring-rose-500/20'
                                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                            }`}
                          >
                            <X className="w-4 h-4 text-rose-600" />
                            <span>Out of Stock (Temporarily Backordered)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: VARIATIONS & COLORS (PRIMARY USER REQUEST) */}
                  {activeTab === 'variations' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                            <Palette className="w-4 h-4 text-[#1212ff]" />
                            <span>Product Color Variations</span>
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            When customers click a color swatch on the single product page, the main image switches to that variation's photo.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={addVariation}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1212ff] hover:bg-[#0e0ecc] text-white text-xs font-extrabold shadow-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Variation</span>
                        </button>
                      </div>

                      {/* Variations Cards List */}
                      {colors.length === 0 ? (
                        <div className="text-center py-10 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 p-6">
                          <Palette className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <h5 className="font-bold text-stone-700 text-sm">No Color Variations Configured</h5>
                          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto mb-4">
                            This product currently uses only the primary featured image. Add variations to enable interactive color switching.
                          </p>
                          <button
                            type="button"
                            onClick={addVariation}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1212ff] text-white text-xs font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Color Variation</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow relative space-y-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-stone-100 text-stone-600">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-extrabold text-stone-800">
                                    {color.name || `Variation #${idx + 1}`}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeVariation(idx)}
                                  className="text-stone-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                                  title="Remove this variation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                
                                {/* 1. Color Swatch & Hex Picker (4 cols) */}
                                <div className="md:col-span-4 space-y-2">
                                  <label className="block text-[11px] font-bold text-stone-600 uppercase">
                                    Color Swatch & Hex Code
                                  </label>
                                  
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={color.color_code || '#1212ff'}
                                      onChange={(e) => updateVariation(idx, 'color_code', e.target.value)}
                                      className="w-10 h-10 p-0.5 rounded-lg border border-stone-300 cursor-pointer bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={color.color_code || '#1212ff'}
                                      onChange={(e) => updateVariation(idx, 'color_code', e.target.value)}
                                      placeholder="#hex"
                                      className="flex-1 px-3 py-2 text-xs font-mono font-bold border border-stone-300 rounded-lg focus:outline-none focus:border-[#1212ff]"
                                    />
                                  </div>

                                  {/* Quick Preset Colors */}
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {COLOR_PRESETS.slice(0, 8).map((preset) => (
                                      <button
                                        key={preset.code}
                                        type="button"
                                        onClick={() => {
                                          updateVariation(idx, 'color_code', preset.code);
                                          if (!color.name || color.name.startsWith('Color ')) {
                                            updateVariation(idx, 'name', preset.name);
                                          }
                                        }}
                                        title={preset.name}
                                        className="w-5 h-5 rounded-full border border-stone-300 hover:scale-125 transition-transform"
                                        style={{ backgroundColor: preset.code }}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* 2. Color Name & Optional SKU (4 cols) */}
                                <div className="md:col-span-4 space-y-2">
                                  <div>
                                    <label className="block text-[11px] font-bold text-stone-600 uppercase">
                                      Color / Finish Name
                                    </label>
                                    <input
                                      type="text"
                                      value={color.name}
                                      onChange={(e) => updateVariation(idx, 'name', e.target.value)}
                                      placeholder="e.g. Pitch Black, Breakaway Blue"
                                      className="w-full px-3 py-2 text-xs font-bold border border-stone-300 rounded-lg focus:outline-none focus:border-[#1212ff]"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-stone-500 uppercase">
                                      Variation SKU (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      value={color.sku || ''}
                                      onChange={(e) => updateVariation(idx, 'sku', e.target.value)}
                                      placeholder="e.g. TILE-BLK-01"
                                      className="w-full px-3 py-1.5 text-xs font-mono border border-stone-200 rounded-lg focus:outline-none focus:border-[#1212ff]"
                                    />
                                  </div>
                                </div>

                                {/* 3. Color-Specific Image (4 cols) */}
                                <div className="md:col-span-4 space-y-2">
                                  <label className="block text-[11px] font-bold text-stone-600 uppercase">
                                    Color-Specific Image
                                  </label>

                                  <div className="flex items-center gap-3">
                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                                      {color.image ? (
                                        <Image
                                          src={color.image}
                                          alt={color.name}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                          <ImageIcon className="w-6 h-6" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="space-y-1.5 flex-1">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={(el) => { variationInputRefs.current[idx] = el; }}
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleUploadVariationImage(e.target.files[0], idx);
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => variationInputRefs.current[idx]?.click()}
                                        disabled={uploadingVariationIdx === idx}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold transition-colors"
                                      >
                                        <Upload className="w-3 h-3 text-[#1212ff]" />
                                        <span>{uploadingVariationIdx === idx ? 'Uploading...' : 'Upload Photo'}</span>
                                      </button>
                                      
                                      <input
                                        type="text"
                                        value={color.image || ''}
                                        onChange={(e) => updateVariation(idx, 'image', e.target.value)}
                                        placeholder="Or paste image URL"
                                        className="w-full px-2 py-1 text-[10px] border border-stone-200 rounded font-mono focus:outline-none focus:border-[#1212ff]"
                                      />
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: SPECIFICATIONS */}
                  {activeTab === 'specs' && (
                    <div className="space-y-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
                        Technical Flooring Specifications
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Material / Fiber Composition
                          </label>
                          <input
                            type="text"
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            placeholder="e.g. 100% Solution Dyed Nylon, Stone Composite (SPC)"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#1212ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Backing / Underlayment
                          </label>
                          <input
                            type="text"
                            value={backing}
                            onChange={(e) => setBacking(e.target.value)}
                            placeholder="e.g. ActionBac®, Attached 1.5mm IXPE Pad, Jute"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#1212ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Traffic Rating / Application
                          </label>
                          <input
                            type="text"
                            value={trafficRating}
                            onChange={(e) => setTrafficRating(e.target.value)}
                            placeholder="e.g. Severe Commercial / High Residential"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#1212ff]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Country of Origin / Certification
                          </label>
                          <input
                            type="text"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            placeholder="e.g. Canada, USA, Imported Authentic Weave"
                            className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#1212ff]"
                          />
                        </div>
                      </div>

                      {/* Custom Specs List */}
                      <div className="pt-3 border-t border-stone-100">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-stone-700 uppercase">
                            Additional Custom Specifications
                          </label>
                          <button
                            type="button"
                            onClick={addCustomSpec}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1212ff] hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Custom Spec</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {customSpecs.map((spec, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={spec.key}
                                onChange={(e) => updateCustomSpec(idx, 'key', e.target.value)}
                                placeholder="Spec Name (e.g. Thickness, Wear Layer)"
                                className="w-1/3 px-3 py-1.5 text-xs font-semibold border border-stone-300 rounded-lg focus:outline-none focus:border-[#1212ff]"
                              />
                              <input
                                type="text"
                                value={spec.value}
                                onChange={(e) => updateCustomSpec(idx, 'value', e.target.value)}
                                placeholder="Value (e.g. 20mil, 10mm)"
                                className="flex-1 px-3 py-1.5 text-xs font-semibold border border-stone-300 rounded-lg focus:outline-none focus:border-[#1212ff]"
                              />
                              <button
                                type="button"
                                onClick={() => removeCustomSpec(idx)}
                                className="text-stone-400 hover:text-rose-600 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: KEY FEATURES */}
                  {activeTab === 'features' && (
                    <div className="space-y-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 pb-2 border-b border-stone-100">
                        Product Highlights & Selling Points (Bullet Points)
                      </h4>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newFeatureText}
                          onChange={(e) => setNewFeatureText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addFeature();
                            }
                          }}
                          placeholder="e.g. StainMaster® Soil Shield, 100% Waterproof SPC, Zero VOC"
                          className="flex-1 px-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1212ff]"
                        />
                        <button
                          type="button"
                          onClick={addFeature}
                          className="px-4 py-2.5 rounded-xl bg-[#1212ff] text-white text-xs font-bold hover:bg-[#0c0ccd] transition-colors"
                        >
                          Add Feature
                        </button>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2 pt-2">
                        {features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800"
                          >
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>{feat}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFeature(idx)}
                              className="text-stone-400 hover:text-rose-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* 4. Short Description Box */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Product Short Description (Excerpt)
              </label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary displayed right below the price on the single product page..."
                className="w-full text-xs text-stone-800 border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#1212ff]"
              />
            </div>

          </div>


          {/* ================= RIGHT SIDEBAR METABOXES (4 COLS) ================= */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* METABOX 1: PUBLISH ACTIONS */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Save className="w-4 h-4 text-[#ff0000]" />
                  <span>Publish Meta</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {isVisible ? 'Active' : 'Draft'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Visibility Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 font-semibold">Store Visibility:</span>
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                      isVisible
                        ? 'bg-blue-50 border-blue-200 text-[#1212ff]'
                        : 'bg-stone-100 border-stone-200 text-stone-500'
                    }`}
                  >
                    {isVisible ? 'Public & Searchable' : 'Hidden / Draft'}
                  </button>
                </div>

                {/* Homepage Featured Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-stone-600 font-semibold">Featured on Homepage:</span>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#1212ff] rounded border-stone-300 focus:ring-[#1212ff] cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-extrabold shadow-md shadow-red-500/25 transition-all text-center flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{mode === 'create' ? 'Publish Product' : 'Save & Update'}</span>
                    </>
                  )}
                </button>

                {mode === 'edit' && productId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deleting ? 'Deleting...' : 'Move to Trash'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* METABOX 2: PRIMARY FEATURED IMAGE */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#1212ff]" />
                  <span>Featured Product Image</span>
                </h4>
              </div>

              {/* Preview Card */}
              <div className="relative w-full h-52 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                <Image
                  src={image}
                  alt={name || 'Product Image'}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Upload & URL Input */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadFeatured(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#1212ff]" />
                  <span>{uploadingImage ? 'Uploading Image...' : 'Upload New Featured Image'}</span>
                </button>

                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Or paste image URL"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-stone-200 rounded-lg focus:outline-none focus:border-[#1212ff]"
                />
              </div>
            </div>

            {/* METABOX 3: PRODUCT GALLERY IMAGES */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#1212ff]" />
                  <span>Gallery Images</span>
                </h4>
                <span className="text-[10px] font-bold text-stone-400">
                  {galleryImages.length} images
                </span>
              </div>

              {/* Gallery Thumbnails Grid */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.map((imgUrl, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group">
                      <Image
                        src={imgUrl}
                        alt={`Gallery ${i}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setGalleryImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload to Gallery */}
              <input
                type="file"
                multiple
                accept="image/*"
                ref={galleryInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUploadGallery(e.target.files);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#1212ff]" />
                <span>{uploadingGallery ? 'Uploading Gallery...' : 'Add Gallery Images'}</span>
              </button>
            </div>

            {/* METABOX 4: CATEGORIES & SUBCATEGORIES HIERARCHY */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-[#1212ff]" />
                  <span>Category Hierarchy</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = Object.values(expandedRoots).every(Boolean);
                    const next: Record<string, boolean> = {};
                    CATEGORIES.forEach(c => next[c.id] = !allOpen);
                    setExpandedRoots(next);
                  }}
                  className="text-[10px] text-[#1212ff] font-bold hover:underline"
                >
                  {Object.values(expandedRoots).every(Boolean) ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              {/* Current Selection Pill */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Active Selected Path:
                </span>
                <div className="font-extrabold text-xs text-[#1212ff] break-words">
                  {categoryLabel || 'None selected'}
                </div>
                <div className="flex items-center gap-2 pt-0.5 text-[10px] text-stone-500">
                  <span>Root ID: <code className="font-mono text-stone-800 font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">{categoryId}</code></span>
                </div>
              </div>

              {/* Search Category Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter category or subcategory..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#1212ff]"
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-[10px] font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Hierarchical Category Tree */}
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1 border border-stone-100 rounded-xl p-2 bg-stone-50/40 divide-y divide-stone-100">
                {CATEGORIES.map((root) => {
                  const isRootExpanded = Boolean(expandedRoots[root.id]) || Boolean(categorySearchQuery);
                  const isRootSelected = categoryId === root.id && categoryLabel === root.name;

                  // Filter subcategories if search query is active
                  const filteredSubs = categorySearchQuery
                    ? root.subcategories.filter(s => 
                        s.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                        root.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                        (s.subcategories && s.subcategories.some(ss => ss.name.toLowerCase().includes(categorySearchQuery.toLowerCase())))
                      )
                    : root.subcategories;

                  if (categorySearchQuery && filteredSubs.length === 0 && !root.name.toLowerCase().includes(categorySearchQuery.toLowerCase())) {
                    return null;
                  }

                  return (
                    <div key={root.id} className="pt-1.5 first:pt-0">
                      {/* Root Category Row */}
                      <div className="flex items-center justify-between py-1 px-1 rounded-lg hover:bg-stone-100/70 transition-colors">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {root.subcategories.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggleRoot(root.id)}
                              className="p-1 text-stone-400 hover:text-stone-800 rounded"
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isRootExpanded ? '' : '-rotate-90'}`} />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                            <input
                              type="radio"
                              name="category_hierarchy"
                              checked={isRootSelected}
                              onChange={() => handleSelectCategory(root.id, root.name)}
                              className="text-[#1212ff] focus:ring-[#1212ff] w-3.5 h-3.5"
                            />
                            <span className={`text-xs font-bold truncate ${isRootSelected ? 'text-[#1212ff]' : 'text-stone-900'}`}>
                              {root.name}
                            </span>
                          </label>
                        </div>
                        <span className="text-[10px] text-stone-400 px-1 font-semibold flex-shrink-0">
                          {root.itemCount}
                        </span>
                      </div>

                      {/* Subcategories (Level 1) */}
                      {isRootExpanded && (
                        <div className="pl-5 ml-2.5 border-l-2 border-stone-200/80 space-y-1 py-1">
                          {filteredSubs.map((sub) => {
                            const subFullPath = `${root.name} > ${sub.name}`;
                            const isSubSelected = categoryLabel === subFullPath || categoryLabel === sub.name;
                            const isSubExpanded = Boolean(expandedSubs[sub.slug]) || Boolean(categorySearchQuery);
                            const hasSubsubs = sub.subcategories && sub.subcategories.length > 0;

                            return (
                              <div key={sub.slug} className="space-y-1">
                                <div className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-stone-100/70">
                                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    {hasSubsubs ? (
                                      <button
                                        type="button"
                                        onClick={() => toggleSub(sub.slug)}
                                        className="p-0.5 text-stone-400 hover:text-stone-800"
                                      >
                                        <ChevronDown className={`w-3 h-3 transition-transform ${isSubExpanded ? '' : '-rotate-90'}`} />
                                      </button>
                                    ) : (
                                      <div className="w-4" />
                                    )}
                                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                      <input
                                        type="radio"
                                        name="category_hierarchy"
                                        checked={isSubSelected}
                                        onChange={() => handleSelectCategory(root.id, subFullPath)}
                                        className="text-[#1212ff] focus:ring-[#1212ff] w-3 h-3"
                                      />
                                      <span className={`text-xs truncate ${isSubSelected ? 'text-[#1212ff] font-bold' : 'text-stone-700 font-medium'}`}>
                                        {sub.name}
                                      </span>
                                    </label>
                                  </div>
                                </div>

                                {/* Sub-Subcategories (Level 2) */}
                                {hasSubsubs && isSubExpanded && (
                                  <div className="pl-5 ml-2 border-l-2 border-stone-300 space-y-1 py-0.5">
                                    {sub.subcategories!.map((subsub) => {
                                      const subsubFullPath = `${root.name} > ${sub.name} > ${subsub.name}`;
                                      const isSubsubSelected = categoryLabel === subsubFullPath || categoryLabel === subsub.name;

                                      return (
                                        <label
                                          key={subsub.slug}
                                          className="flex items-center gap-2 py-0.5 px-1 rounded cursor-pointer hover:bg-stone-100/70"
                                        >
                                          <input
                                            type="radio"
                                            name="category_hierarchy"
                                            checked={isSubsubSelected}
                                            onChange={() => handleSelectCategory(root.id, subsubFullPath)}
                                            className="text-[#1212ff] focus:ring-[#1212ff] w-3 h-3"
                                          />
                                          <span className={`text-[11px] truncate ${isSubsubSelected ? 'text-[#1212ff] font-bold' : 'text-stone-600'}`}>
                                            ↳ {subsub.name}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Manual Category Path Override */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Custom Category Path Override:
                </label>
                <input
                  type="text"
                  value={categoryLabel}
                  onChange={(e) => setCategoryLabel(e.target.value)}
                  placeholder="e.g. Carpets > Carpet Tiles > Stonewall"
                  className="w-full px-2.5 py-1.5 text-xs font-medium border border-stone-200 rounded-lg focus:outline-none focus:border-[#1212ff] bg-stone-50"
                />
              </div>
            </div>

            {/* METABOX 5: BADGE / RIBBON */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ff0000]" />
                  <span>Product Badge / Ribbon</span>
                </h4>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {BADGE_PRESETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(badge === b ? '' : b)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      badge === b
                        ? 'bg-[#ff0000] text-white border-[#ff0000]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Or custom badge (e.g. Clearance)"
                className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-[#1212ff]"
              />
            </div>

          </div>

        </form>
      </main>

    </div>
  );
}
