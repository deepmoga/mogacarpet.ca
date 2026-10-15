'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    clearCart,
    setQuoteModalOpen 
  } = useCart();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 500;
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-[#0b1026]/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#1212ff]" />
                <h3 className="font-bold text-stone-900 text-base">Your Flooring Cart</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1212ff] border border-blue-200">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Close Cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs">
              <div className="flex items-center justify-between text-stone-700 font-medium mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#1212ff]" />
                  {remaining > 0 ? (
                    <span>Add <strong className="text-stone-900">${remaining.toFixed(2)}</strong> for Free GTA Delivery</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">🎉 You unlocked FREE GTA Delivery!</span>
                  )}
                </span>
                <span className="text-[11px] font-bold text-[#1212ff]">{progress}%</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#1212ff] to-[#ff0000] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#1212ff]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800 text-sm">Your cart is currently empty</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Browse our best-selling commercial carpets, ancient garden rugs, and waterproof vinyl tiles.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    const el = document.getElementById('products-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#1212ff] hover:bg-[#ff0000] transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                    <Image
                      src={item.selectedImage || item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          aria-label="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#1212ff] font-medium">{item.product.categoryName || item.product.category_label || item.product.category}</span>
                        {item.selectedColor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1212ff] border border-blue-200">
                            Color: {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-stone-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 rounded-l"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-100 text-stone-600 rounded-r"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-stone-900">
                          ${(Number(item.product.price) * item.quantity).toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-stone-400">
                          ${Number(item.product.price).toFixed(2)} / {item.product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Subtotal & Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-stone-900 text-sm">${subtotal.toFixed(2)} CAD</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Estimated GTA Tax (HST 13%):</span>
                  <span>${(subtotal * 0.13).toFixed(2)} CAD</span>
                </div>
                <div className="flex justify-between text-stone-900 font-black text-sm pt-2 border-t border-stone-200">
                  <span>Estimated Total:</span>
                  <span className="text-[#1212ff] text-base">${(subtotal * 1.13).toFixed(2)} CAD</span>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setQuoteModalOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Request Official Installation Quote</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    alert('Order request submitted to Moga Carpet Brampton! An associate will confirm order fulfillment & delivery schedule with you.');
                    clearCart();
                    setIsCartOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1212ff] hover:bg-[#0a0ad8] transition-colors"
                >
                  Proceed to Secure Checkout
                </button>
              </div>

              {/* Trust disclaimer */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct Mill Certified • Full Manufacturer Warranty</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
