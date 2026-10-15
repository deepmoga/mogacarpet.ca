'use client';

import React, { useState } from 'react';
import { X, Calculator, CheckCircle2, Phone, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function QuoteModal() {
  const { quoteModalOpen, setQuoteModalOpen } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Brampton',
    sqft: '800',
    category: 'Plush Broadloom Carpet & Underpad',
    serviceType: 'Free In-Home Measurement & Samples',
    message: '',
  });

  if (!quoteModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.error(err);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setQuoteModalOpen(false);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => setQuoteModalOpen(false)}
        className="fixed inset-0 bg-[#0b1026]/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 overflow-hidden shadow-2xl border border-stone-200 z-10 my-8">
        {/* Close Button */}
        <button
          onClick={() => setQuoteModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-2xl font-bold text-stone-900">
              Free Estimate Request Received!
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-stone-900">{formData.name}</strong>. One of our flooring estimators from Moga Carpet Brampton will call or text you shortly at <strong className="text-stone-900">{formData.phone}</strong> with an itemized price and to coordinate physical sample delivery.
            </p>
            <div className="pt-4">
              <a
                href="tel:19058482222"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1212ff] text-white font-bold text-xs hover:bg-[#0a0ad8] transition-colors shadow-md"
              >
                <Phone className="w-4 h-4 text-[#ff4d4d]" />
                <span>Urgent Question? Call 1-905-848-2222</span>
              </a>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1212ff] border border-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                <Calculator className="w-3.5 h-3.5 text-[#ff0000]" />
                <span>Zero Obligation Quote</span>
              </div>
              <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                Request Free In-Home Measurement
              </h3>
              <p className="text-stone-500 text-xs mt-1">
                Our specialists bring broadloom rolls, luxury vinyl planks, and carpet tile swatches right to your residence.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(905) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City / GTA Region
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff] cursor-pointer"
                  >
                    <option value="Brampton">Brampton, ON</option>
                    <option value="Mississauga">Mississauga, ON</option>
                    <option value="Toronto">Toronto / Etobicoke</option>
                    <option value="Vaughan">Vaughan / Woodbridge</option>
                    <option value="Oakville">Oakville / Burlington</option>
                    <option value="Caledon">Caledon / Georgetown</option>
                    <option value="Other GTA">Other GTA Region</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Flooring Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff] cursor-pointer"
                  >
                    <option value="Plush Broadloom Carpet & Underpad">Residential Carpet & Underpad</option>
                    <option value="Commercial Carpet Loop & Tiles">Commercial Loop & Carpet Tiles</option>
                    <option value="100% Waterproof SPC Luxury Vinyl">Waterproof Luxury Vinyl Planks</option>
                    <option value="Ancient Garden Luxury Area Rugs">Ancient Garden Luxury Rugs</option>
                    <option value="Solid Canadian Hardwood">Canadian Solid Hardwood</option>
                    <option value="Custom Stair Runner Binding">Custom Stair Runner Binding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Approximate Area (Sq Ft)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500, 1000, 2500"
                    value={formData.sqft}
                    onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Service Requested
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Free In-Home Measurement & Samples',
                    'Complete Supply & Installation',
                    'Material Supply Only (Brampton Pickup)',
                    'Commercial Tender / Contractor Pricing',
                  ].map((srv) => (
                    <label
                      key={srv}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-[11px] font-medium transition-all ${
                        formData.serviceType === srv
                          ? 'border-[#1212ff] bg-blue-50 text-[#1212ff] font-semibold'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceType"
                        checked={formData.serviceType === srv}
                        onChange={() => setFormData({ ...formData, serviceType: srv })}
                        className="accent-[#1212ff]"
                      />
                      <span>{srv}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Additional Details or Questions
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about subfloor conditions, stairs, removal of old carpets..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] shadow-md hover:shadow-lg transition-all"
              >
                Submit Estimate Request (100% Free)
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>No pressure sales • Best wholesale rates guaranteed</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
