'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck, Layers } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!quickViewProduct) return null;

  const handleAdd = () => {
    addToCart(quickViewProduct, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuickViewProduct(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-[#0b1026]/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 z-10 my-8">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Column */}
          <div className="relative h-72 md:h-full bg-stone-100 min-h-[340px]">
            <Image
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              fill
              className="object-cover"
            />
            {quickViewProduct.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-[#ff0000] text-white shadow-sm">
                {quickViewProduct.badge}
              </span>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#1212ff] uppercase tracking-wide">
                  {quickViewProduct.categoryName}
                </span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                  <span className="font-bold text-stone-900">{quickViewProduct.rating}</span>
                  <span className="text-stone-400 ml-1">({quickViewProduct.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-extrabold text-stone-900 leading-snug">
                {quickViewProduct.name}
              </h3>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-stone-900">
                  ${Number(quickViewProduct.price).toFixed(2)}
                </span>
                {quickViewProduct.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ${Number(quickViewProduct.originalPrice).toFixed(2)}
                  </span>
                )}
                <span className="text-xs font-semibold text-stone-500 uppercase">
                  per {quickViewProduct.unit}
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-stone-600 text-xs leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Specifications Box */}
              <div className="mt-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 pb-1 border-b border-stone-200">
                  <Layers className="w-3.5 h-3.5 text-[#1212ff]" />
                  <span>Technical Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400 block">Material:</span>
                    <span className="font-semibold text-stone-800">{quickViewProduct.specs.material}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Backing:</span>
                    <span className="font-semibold text-stone-800">{quickViewProduct.specs.backing}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Traffic Rating:</span>
                    <span className="font-semibold text-stone-800">{quickViewProduct.specs.trafficRating}</span>
                  </div>
                  {quickViewProduct.specs.origin && (
                    <div>
                      <span className="text-stone-400 block">Origin:</span>
                      <span className="font-semibold text-stone-800">{quickViewProduct.specs.origin}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Features */}
              <div className="mt-4">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-stone-600">
                  {quickViewProduct.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quantity & CTA */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-300 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-l-xl font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-r-xl font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 px-5 rounded-xl text-xs font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Added to Your Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-white" />
                      <span>Add to Cart (${(quickViewProduct.price * quantity).toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#1212ff]" />
                  In-Stock for Immediate GTA Dispatch
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Mill Warranty
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
