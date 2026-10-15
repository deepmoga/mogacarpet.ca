'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  SlidersHorizontal, 
  Check, 
  Loader2, 
  PhoneCall, 
  Send,
  Eye,
  Filter
} from 'lucide-react';
import { CATEGORIES, Category } from '@/data/categories';
import ProductInquiryModal from '@/components/ProductInquiryModal';
import ProductCard from '@/components/ProductCard';

interface ProductsClientProps {
  initialProducts: any[];
  initialTotal: number;
}

export default function ProductsClient({ initialProducts, initialTotal }: ProductsClientProps) {
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [total, setTotal] = useState<number>(initialTotal || 0);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>((initialProducts?.length || 0) < initialTotal);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  // Inquiry Modal state for quick enquiry from product card
  const [inquiryProduct, setInquiryProduct] = useState<any | null>(null);

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch initial/filtered products when search, category, or sort changes
  const fetchFilteredProducts = useCallback(async () => {
    setInitialLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', '1');
      params.set('limit', '20');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        const totalCount = data.pagination?.total || 0;
        setTotal(totalCount);
        setPage(1);
        setHasMore((data.products?.length || 0) < totalCount);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [search, selectedCategory, sortBy]);

  // Handle filter changes (debounced search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchFilteredProducts]);

  // Load next 20 products on scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || initialLoading) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', String(nextPage));
      params.set('limit', '20');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.products?.length > 0) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(nextPage);
        const newTotal = data.pagination?.total || total;
        setTotal(newTotal);
        if (products.length + data.products.length >= newTotal) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more products:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, initialLoading, search, selectedCategory, sortBy, products.length, total]);

  // Setup IntersectionObserver on sentinelRef
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !initialLoading) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [loadMore, hasMore, loadingMore, initialLoading]);

  return (
    <div className="bg-stone-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ========================================================= */}
        {/* SECTION 1: ALL CATEGORIES CARDS (HERO SECTION) */}
        {/* ========================================================= */}
        <section id="categories-section" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1212ff] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ff0000]" />
                <span>Our Product Collections</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                Explore Flooring By Category
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Click any department below to view styles or jump straight to curated collections. We stock over 1,300 commercial and residential flooring products in our Brampton warehouse.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>8 Primary Departments • GTA Wholesale Direct</span>
            </div>
          </div>

          {/* 8 Categories Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat: Category) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl ${
                    isSelected 
                      ? 'border-[#1212ff] ring-2 ring-[#1212ff]/20 shadow-md' 
                      : 'border-stone-200 hover:border-blue-300'
                  }`}
                >
                  {/* Category Image Header */}
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    <Image
                      src={cat.image || '/images/slide01.jpg'}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {cat.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff0000] text-white shadow-sm">
                          {cat.badge}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-stone-800 backdrop-blur-sm">
                        {cat.itemCount}
                      </span>
                    </div>

                    {/* Bottom Category Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-black leading-tight drop-shadow-sm">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Popular Subcategories Tags */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Popular Subcategories:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cat.subcategories.slice(0, 3).map((sub) => (
                            <button
                              key={sub.slug}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                setSearch(sub.name);
                                window.scrollTo({ top: 750, behavior: 'smooth' });
                              }}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-blue-50 text-stone-700 hover:text-[#1212ff] transition-colors"
                            >
                              {sub.name}
                            </button>
                          ))}
                          {cat.subcategories.length > 3 && (
                            <span className="text-[10px] text-stone-400 self-center">
                              +{cat.subcategories.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(isSelected ? 'all' : cat.id);
                          setSearch('');
                          window.scrollTo({ top: 750, behavior: 'smooth' });
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#1212ff] text-white shadow-sm'
                            : 'bg-blue-50 hover:bg-[#1212ff] text-[#1212ff] hover:text-white'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        <span>{isSelected ? 'Showing Filter' : 'Filter Below'}</span>
                      </button>

                      <Link
                        href={`/category/${cat.id}`}
                        className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-[#ff0000] hover:border-red-200 transition-colors"
                        title={`View Dedicated ${cat.name} Page`}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: PRODUCTS CATALOG WITH SCROLL PAGINATION */}
        {/* ========================================================= */}
        <section id="products-catalog-section" className="space-y-6 pt-4 border-t border-stone-200">
          
          {/* Header & Controls Bar */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span>Product Catalog</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-[#1212ff] font-bold border border-stone-200">
                    {total.toLocaleString()} Products Available
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Showing 20 products initially • Scroll down to continuously load more
                </p>
              </div>

              {/* Live Search Input */}
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products, styles, collections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Department Filter Pills & Sort Select */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#1212ff] text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  All Products ({total})
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === c.id
                        ? 'bg-[#1212ff] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {c.shortTitle || c.name}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                <span className="text-xs text-stone-500 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#1212ff]"
                >
                  <option value="newest">Featured / Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="title_asc">Name: A to Z</option>
                </select>
              </div>

            </div>
          </div>

          {/* Product Grid */}
          {initialLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#1212ff] animate-spin" />
              <p className="text-xs font-bold text-stone-600">Loading flooring catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <Layers className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-800">No products found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No matching flooring products found for "{search}". Try searching for another style or clear your filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-[#1212ff] text-white text-xs font-bold hover:bg-[#0a0ad8]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onInquire={(p) => setInquiryProduct(p)}
                />
              ))}
            </div>
          )}

          {/* ========================================================= */}
          {/* INFINITE SCROLL SENTINEL & STATUS INDICATOR */}
          {/* ========================================================= */}
          <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-sm animate-pulse">
                <Loader2 className="w-4 h-4 text-[#1212ff] animate-spin" />
                <span>Loading next 20 products...</span>
              </div>
            )}

            {!hasMore && products.length > 0 && !initialLoading && (
              <div className="text-center space-y-1">
                <span className="text-xs font-semibold text-stone-400 block">
                  ✓ All {products.length} matching flooring products loaded
                </span>
                <p className="text-[11px] text-stone-400">
                  Can't find a specific commercial broadloom or custom carpet? Call our Brampton warehouse at (905) 848-2222.
                </p>
              </div>
            )}
          </div>

        </section>

      </div>

      {/* Direct Product Inquiry Modal */}
      {inquiryProduct && (
        <ProductInquiryModal
          isOpen={Boolean(inquiryProduct)}
          onClose={() => setInquiryProduct(null)}
          product={{
            id: String(inquiryProduct.id),
            name: inquiryProduct.name,
            sku: inquiryProduct.sku,
            price: inquiryProduct.price,
            unit: inquiryProduct.unit,
            image: inquiryProduct.image,
          }}
          initialQuantity={1}
        />
      )}
    </div>
  );
}
