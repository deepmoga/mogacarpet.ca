'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Send, CheckCircle2, Phone, Mail, User, Ruler, AlertCircle, Sparkles } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface ProductInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string | number;
    name: string;
    sku?: string | null;
    price: number | string;
    unit?: string;
    image?: string;
  };
  selectedColor?: string;
  initialQuantity?: number;
}

export default function ProductInquiryModal({
  isOpen,
  onClose,
  product,
  selectedColor,
  initialQuantity = 1,
}: ProductInquiryModalProps) {
  const { settings } = useSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantitySqft, setQuantitySqft] = useState(
    initialQuantity > 1 ? `${initialQuantity} ${product.unit || 'units'}` : ''
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide your phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          product_price: product.price,
          product_image: product.image,
          variation_name: selectedColor || undefined,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          quantity_sqft: quantitySqft || `${initialQuantity} ${product.unit || 'units'}`,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSubmittedInquiry(data.inquiry_number);
    } catch (err: any) {
      setError(err.message || `Something went wrong. Please call us directly at ${settings.contact_phone || '(905) 848-2222'}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedInquiry(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#1212ff] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/20 text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Direct Product Inquiry</h3>
              <p className="text-[11px] text-blue-100">Factory direct quotes, stock checks & contractor pricing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {submittedInquiry ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-black text-stone-900">Inquiry Received!</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Reference: <span className="font-mono font-bold text-[#1212ff]">{submittedInquiry}</span>
                </p>
              </div>
              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{name}</strong>! Our Brampton showroom specialists have received your inquiry for <strong>{product.name}</strong> and will get back to you with wholesale availability and pricing within 1-2 business hours.
              </p>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <div>Need an immediate answer?</div>
                <a href={`tel:${(settings.contact_phone || '19058482222').replace(/\D/g, '')}`} className="inline-flex items-center gap-1.5 font-bold text-[#ff0000] hover:underline">
                  <Phone className="w-3.5 h-3.5" /> Call {settings.contact_phone || '(905) 848-2222'}
                </a>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-full bg-[#1212ff] text-white text-xs font-bold hover:bg-[#0a0ad8] transition-colors shadow-md"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Summary Card */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-stone-200 flex-shrink-0">
                  <Image
                    src={product.image || '/images/slide01.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">{product.name}</h4>
                  {selectedColor && (
                    <p className="text-[11px] font-semibold text-[#1212ff]">
                      Variation / Color: <span className="font-bold">{selectedColor}</span>
                    </p>
                  )}
                  {product.sku && (
                    <p className="text-[11px] text-stone-500">SKU: {product.sku}</p>
                  )}
                  <p className="text-xs font-bold text-[#ff0000]">
                    ${Number(product.price).toFixed(2)} {product.unit ? `/ ${product.unit}` : ''}
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Name <span className="text-[#ff0000]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Phone Number <span className="text-[#ff0000]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. (905) 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address <span className="text-[#ff0000]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. david@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                    />
                  </div>
                </div>

                {/* Estimated Sq Ft / Quantity */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Estimated Sq. Ft. / Quantity
                  </label>
                  <div className="relative">
                    <Ruler className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. 500 sq ft / 2 rolls"
                      value={quantitySqft}
                      onChange={(e) => setQuantitySqft(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Message / Special Request (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Need installation? Stairs? Commercial delivery timeline? Mention details here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Product Inquiry</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-stone-400 text-center">
                Your contact information is strictly confidential and used only to respond to your inquiry.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
