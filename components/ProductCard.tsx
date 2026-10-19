'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Send, Eye } from 'lucide-react';

export interface ProductCardData {
  id: number | string;
  name: string;
  slug?: string;
  category_id?: string;
  category_label?: string;
  categoryName?: string;
  price: number | string;
  regular_price?: number | string | null;
  sale_price?: number | string | null;
  unit?: string;
  badge?: string | null;
  in_stock?: boolean | number;
  image?: string;
  colors?: any;
}

interface ProductCardProps {
  product: ProductCardData;
  onInquire: (product: ProductCardData) => void;
}

export default function ProductCard({ product, onInquire }: ProductCardProps) {
  const categoryText = product.category_label || product.categoryName || product.category_id || 'Flooring Collection';
  const isCarpetCategory =
    product.category_id === 'carpets' ||
    product.category_id === 'carpet-tiles' ||
    categoryText.toLowerCase().includes('carpet');

  let rawUnit = product.unit;
  if (isCarpetCategory && (!rawUnit || rawUnit.toLowerCase().includes('yd'))) {
    rawUnit = 'sq. ft.';
  }
  const unitText = rawUnit ? (rawUnit.startsWith('/') ? rawUnit : `/ ${rawUnit}`) : (isCarpetCategory ? '/ sq. ft.' : '/ sq. yd.');
  const isInStock = product.in_stock !== false && product.in_stock !== 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div className="relative">
        {/* Product Image */}
        <Link href={`/product/${product.id}`} className="block relative h-48 sm:h-56 bg-stone-100 overflow-hidden">
          <Image
            src={product.image || '/images/slide01.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1212ff] text-white shadow-sm">
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block truncate">
            {categoryText}
          </span>
          <Link 
            href={`/product/${product.id}`}
            className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#1212ff] transition-colors line-clamp-2 block"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        <div className="pt-2 border-t border-stone-100 space-y-2.5">
          {/* Price and Stock Status */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-sm sm:text-base font-black text-stone-900">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-400 ml-1">
                {unitText}
              </span>
            </div>
            {isInStock && (
              <span className="text-[11px] font-bold text-teal-600">
                In Stock
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Direct Inquire Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInquire(product);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-[11px] sm:text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-3 h-3 text-white" />
              <span>Inquire</span>
            </button>

            {/* Quick View / Single Product Link */}
            <Link
              href={`/product/${product.id}`}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-[#1212ff] hover:border-blue-200 transition-colors flex items-center justify-center"
              title="View Product Details"
              aria-label={`View details for ${product.name}`}
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
