'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  SlidersHorizontal, 
  Star, 
  ShoppingBag, 
  Heart, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CATEGORIES } from '@/data/categories';
import ProductCard, { ProductCardData } from '@/components/ProductCard';
import ProductInquiryModal from '@/components/ProductInquiryModal';

export default function ShopClient({ initialProducts, initialPagination, initialCategory = '' }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [total, setTotal] = useState<number>(initialPagination?.total || (initialProducts?.length || 0));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean>((initialProducts?.length || 0) < (initialPagination?.total || 0));
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || initialCategory || 'all');
  const [stockFilter, setStockFilter] = useState(searchParams?.get('stock') || 'all');
  const [sortBy, setSortBy] = useState(searchParams?.get('sortBy') || 'newest');

  const [addedId, setAddedId] = useState<string | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<ProductCardData | null>(null);

  // Sentinel ref for infinite scroll
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const isInitialMount = React.useRef(true);

  // Fetch initial/filtered products when search, category, or sort changes
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (stockFilter && stockFilter !== 'all') params.set('stock', stockFilter);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', '1');
      params.set('limit', '24');

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
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, stockFilter, sortBy]);

  // Handle filter changes (debounced search, category, sort changes)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // If no initialProducts provided, fetch first page
      if (!initialProducts || initialProducts.length === 0) {
        fetchFilteredProducts();
      }
      return;
    }
    const timer = setTimeout(() => {
      fetchFilteredProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchFilteredProducts]);

  // Load next 24 products on scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (stockFilter && stockFilter !== 'all') params.set('stock', stockFilter);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', String(nextPage));
      params.set('limit', '24');

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
  }, [page, loadingMore, hasMore, loading, search, selectedCategory, stockFilter, sortBy, products.length, total]);

  // Setup IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
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
  }, [loadMore, hasMore, loadingMore, loading]);

  const handleAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div className="bg-stone-50/50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1212ff] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ff0000]" />
            <span>Complete Factory-Direct Flooring Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {selectedCategory && selectedCategory !== 'all'
              ? (CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory.replace(/-/g, ' ').toUpperCase())
              : 'Browse All Flooring Products'}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
            {selectedCategory && selectedCategory !== 'all'
              ? (CATEGORIES.find(c => c.id === selectedCategory)?.description || `Explore ${total.toLocaleString()} styles in this department.`)
              : `Explore ${total ? `${total.toLocaleString()} styles` : 'over 1,300 styles'} of residential broadloom carpets, commercial carpet tiles, 100% waterproof SPC vinyl planks, and designer area rugs directly from our Brampton warehouse.`}
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                placeholder="Search by product name, SKU, or style..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1212ff] focus:ring-2 focus:ring-[#1212ff]/20 transition-all placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Department Dropdown (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm rounded-2xl px-3.5 py-3 focus:outline-none focus:border-[#1212ff] cursor-pointer"
              >
                <option value="all">All Departments ({total})</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Filter (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm rounded-2xl px-3 py-3 focus:outline-none focus:border-[#1212ff] cursor-pointer"
              >
                <option value="all">All Stock Statuses</option>
                <option value="instock">In-Stock Only</option>
                <option value="outofstock">Special Order</option>
              </select>
            </div>

            {/* Sort Dropdown (2 cols) */}
            <div className="md:col-span-2 flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm rounded-2xl px-3 py-3 focus:outline-none focus:border-[#1212ff] cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

          </div>

          {/* Quick Department Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#1212ff] text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-blue-50 hover:text-[#1212ff]'
              }`}
            >
              All Products
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#1212ff] text-white shadow-md'
                    : 'bg-stone-100 text-stone-600 hover:bg-blue-50 hover:text-[#1212ff]'
                }`}
              >
                {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Active Info */}
        <div className="flex items-center justify-between text-xs text-stone-500 mb-6">
          <div>
            Showing <strong className="text-stone-900">{products.length}</strong> of{' '}
            <strong className="text-stone-900">{total}</strong> products
            {selectedCategory !== 'all' && (
              <span> in <strong className="text-[#1212ff] uppercase">{selectedCategory.replace(/-/g, ' ')}</strong></span>
            )}
          </div>
          <div className="text-stone-400 hidden sm:block">
            Scroll down to view more styles automatically
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 text-center text-[#1212ff] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#1212ff]" />
            <p className="text-xs font-bold text-stone-600">Loading catalog from database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1212ff] flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-stone-900">No products found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't find any flooring styles matching your filter. Try adjusting your search keyword or clearing selected departments.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setStockFilter('all');
                setPage(1);
              }}
              className="px-5 py-2.5 rounded-full bg-[#1212ff] text-white font-bold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  category_label: product.category_label || product.category_id,
                  price: product.price,
                  regular_price: product.regular_price,
                  unit: product.unit,
                  badge: product.badge || 'Best Seller',
                  in_stock: product.in_stock,
                  image: product.image,
                }}
                onInquire={(prod) => setInquiryProduct(prod)}
              />
            ))}
          </div>
        )}

        {/* Product Inquiry Modal */}
        {inquiryProduct && (
          <ProductInquiryModal
            isOpen={!!inquiryProduct}
            onClose={() => setInquiryProduct(null)}
            product={inquiryProduct}
          />
        )}

        {/* Infinite Scroll Sentinel & Status */}
        <div ref={sentinelRef} className="py-10 text-center">
          {loadingMore && (
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white border border-stone-200 shadow-sm text-xs font-bold text-[#1212ff]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#ff0000]" />
              <span>Loading more flooring styles...</span>
            </div>
          )}

          {!hasMore && products.length > 0 && !loading && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold border border-stone-200">
              <Sparkles className="w-3.5 h-3.5 text-[#1212ff]" />
              <span>All {total} styles loaded • Browse or search above for specific styles</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
