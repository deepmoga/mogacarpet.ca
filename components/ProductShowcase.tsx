'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import ProductCard, { ProductCardData } from '@/components/ProductCard';
import ProductInquiryModal from '@/components/ProductInquiryModal';

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<'all' | 'carpets' | 'area-rugs' | 'vinyl-flooring' | 'carpet-tiles'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [inquiryProduct, setInquiryProduct] = useState<ProductCardData | null>(null);

  const filteredProducts = useMemo(() => {
    let result = activeTab === 'all' 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.category === activeTab);

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activeTab, sortBy]);

  return (
    <section id="products-section" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1212ff] border border-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#ff0000]" />
              <span>Direct Mill Specials &amp; Featured Inventory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Best Selling Flooring &amp; Rugs
            </h2>
            <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-xl">
              Authentic commercial broadloom, themed prints, ancient garden heirlooms, and stone composite vinyl tiles in stock for fast GTA dispatch.
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:border-[#1212ff] cursor-pointer"
            >
              <option value="featured">Featured Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {[
            { id: 'all', label: 'All Featured' },
            { id: 'carpets', label: 'Joy Carpets & Broadloom' },
            { id: 'area-rugs', label: 'Ancient Garden Rugs' },
            { id: 'vinyl-flooring', label: 'Luxury Waterproof Vinyl (LVT)' },
            { id: 'carpet-tiles', label: 'Carpet Tiles 20″x20″' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1212ff] text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-blue-50 hover:text-[#1212ff]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid — Using the unified Card style with Inquire button */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                category_label: product.categoryName,
                price: product.price,
                regular_price: product.originalPrice,
                unit: product.unit,
                badge: product.badge || 'Best Seller',
                in_stock: true,
                image: product.image,
              }}
              onInquire={(prod) => setInquiryProduct(prod)}
            />
          ))}
        </div>

        {/* View All Shop Products CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#1212ff] hover:bg-[#0c0ccd] text-white font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            <span>Explore All Categories &amp; Products</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* Bottom Catalog Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#0b1026] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-[#182046]">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#ff4d4d] uppercase tracking-wider">
              Free Measurement &amp; Consultation
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Need Help Choosing the Right Flooring?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-light">
              Visit our 50,000 sq ft showroom in Brampton or schedule a flooring specialist to bring commercial carpet, vinyl, and hardwood samples directly to your doorstep.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <Link
              href="/estimator"
              className="px-6 py-3 rounded-full bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-bold shadow-md transition-all"
            >
              Use Flooring Estimator
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all"
            >
              Showroom Directions
            </Link>
          </div>
        </div>

      </div>

      {/* Product Inquiry Modal Popup */}
      {inquiryProduct && (
        <ProductInquiryModal
          isOpen={!!inquiryProduct}
          onClose={() => setInquiryProduct(null)}
          product={inquiryProduct}
        />
      )}
    </section>
  );
}
