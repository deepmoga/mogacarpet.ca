'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  PhoneCall, 
  Sparkles,
  Layers,
  Wrench,
  Check
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Exact Pricing Matrix from https://mogacarpet.ca/estimator/
export const ESTIMATOR_MATRIX: Record<
  string, 
  Record<'Good' | 'Better' | 'Best', { name: string; price: number; description: string }[]>
> = {
  Hardwood: {
    Good: [
      { name: 'Do it yourself', price: 3.99, description: 'Supply only — factory packaged solid/engineered oak' },
      { name: 'Install', price: 6.99, description: 'Professional nail/glue down installation included' },
      { name: 'Full Service', price: 8.99, description: 'Includes old floor tear-out, floor levelling & transition trim' },
    ],
    Better: [
      { name: 'Do it yourself', price: 5.99, description: 'Wide plank Canadian maple / hand scraped hardwood' },
      { name: 'Install', price: 8.99, description: 'Precision fitting & subfloor preparation included' },
      { name: 'Full Service', price: 10.99, description: 'Full removal, acoustic underlayment, mouldings & disposal' },
    ],
    Best: [
      { name: 'Do it yourself', price: 6.99, description: 'Premium wire-brushed European white oak' },
      { name: 'Install', price: 9.99, description: 'Master installer custom layout & staggered fitting' },
      { name: 'Full Service', price: 12.99, description: 'Complete white-glove installation with furniture moving' },
    ],
  },
  Laminate: {
    Good: [
      { name: 'Do it yourself', price: 1.49, description: '8mm AC3 durable click laminate' },
      { name: 'Install', price: 3.75, description: 'Click-lock precision installation' },
      { name: 'Full Service', price: 4.75, description: 'Includes 2mm foam underpad & baseboard shoe mould' },
    ],
    Better: [
      { name: 'Do it yourself', price: 2.69, description: '10mm AC4 commercial wear-layer water-resistant laminate' },
      { name: 'Install', price: 5.19, description: 'Complete floating floor professional install' },
      { name: 'Full Service', price: 6.19, description: 'Old floor removal, acoustic underpad & trim finishing' },
    ],
    Best: [
      { name: 'Do it yourself', price: 3.99, description: '12mm AC5 ultra-heavy waterproof embossed in register' },
      { name: 'Install', price: 6.49, description: 'Certified craftsman installation with vapor barrier' },
      { name: 'Full Service', price: 7.49, description: 'Turnkey prep, transitions, thresholds & site cleanup' },
    ],
  },
  Carpet: {
    Good: [
      { name: 'Do it yourself', price: 1.29, description: 'Builder-grade textured loop carpet (broadloom)' },
      { name: 'Install', price: 2.49, description: 'Standard power-stretch wall-to-wall installation' },
      { name: 'Full Service', price: 7.49, description: 'Heavy traffic prep, tack strips, underpad & haul-away' },
    ],
    Better: [
      { name: 'Do it yourself', price: 2.29, description: 'Plush stain-resistant polyester / textured berber' },
      { name: 'Install', price: 3.85, description: 'Professional power-stretched fit over tack strip' },
      { name: 'Full Service', price: 4.29, description: 'Includes 10mm high-density underpad & seamless joins' },
    ],
    Best: [
      { name: 'Do it yourself', price: 3.59, description: 'Ultra-soft luxury nylon / solution dyed commercial carpet' },
      { name: 'Install', price: 5.19, description: 'Seamless tailored installation for stairs & hallways' },
      { name: 'Full Service', price: 5.99, description: '12mm gold foil memory foam underpad & turnkey service' },
    ],
  },
  Tiles: {
    Good: [
      { name: 'Do it yourself', price: 1.99, description: 'Glazed porcelain & ceramic 12x24 tiles' },
      { name: 'Install', price: 7.25, description: 'Thin-set mortar setting & standard grout' },
      { name: 'Full Service', price: 8.75, description: 'Subfloor cement-board backer, levelling clips & sealing' },
    ],
    Better: [
      { name: 'Do it yourself', price: 3.59, description: 'Polished rectified porcelain tiles' },
      { name: 'Install', price: 8.99, description: 'Laser-levelled layout with stain-resistant grout' },
      { name: 'Full Service', price: 10.69, description: 'Full membrane uncoupling, waterproof barrier & base trim' },
    ],
    Best: [
      { name: 'Do it yourself', price: 4.99, description: 'Large format luxury Italian / Spanish marble look tiles' },
      { name: 'Install', price: 10.98, description: 'Master tile setter installation with epoxy grout' },
      { name: 'Full Service', price: 12.25, description: 'Complete subfloor engineering, heated floor prep & trim' },
    ],
  },
  Cork: {
    Good: [
      { name: 'Do it yourself', price: 3.99, description: 'Natural warm eco-friendly floating cork planks' },
      { name: 'Install', price: 6.49, description: 'Floating click installation' },
      { name: 'Full Service', price: 8.99, description: 'Vapor barrier subfloor preparation & matching thresholds' },
    ],
    Better: [
      { name: 'Do it yourself', price: 4.99, description: 'High-density acoustic insulating cork flooring' },
      { name: 'Install', price: 7.49, description: 'Specialized expansion gap fitting for acoustic comfort' },
      { name: 'Full Service', price: 8.49, description: 'Subfloor levelling, trim finishing & full site cleanup' },
    ],
    Best: [
      { name: 'Do it yourself', price: 7.99, description: 'Commercial-rated UV protective wear-layer designer cork' },
      { name: 'Install', price: 10.49, description: 'Direct glue-down acoustic installation' },
      { name: 'Full Service', price: 12.49, description: 'Complete turn-key soundproofing installation' },
    ],
  },
  Vinyl: {
    Good: [
      { name: 'Do it yourself', price: 3.49, description: '4mm Click SPC 100% waterproof luxury vinyl plank' },
      { name: 'Install', price: 5.49, description: 'Click plank installation over existing subfloor' },
      { name: 'Full Service', price: 7.49, description: 'Includes old floor prep, quarter round trims & cleanup' },
    ],
    Better: [
      { name: 'Do it yourself', price: 4.49, description: '5mm-6mm Rigid Core SPC with 20mil commercial wear layer' },
      { name: 'Install', price: 6.49, description: 'Precision staggered installation with acoustic underlay' },
      { name: 'Full Service', price: 8.49, description: 'Subfloor sanding/patching, transition reducers & disposal' },
    ],
    Best: [
      { name: 'Do it yourself', price: 5.49, description: '7mm-8mm Premium embossed-in-register EIR click vinyl' },
      { name: 'Install', price: 7.49, description: 'Master certified install with flush stair nosing' },
      { name: 'Full Service', price: 9.49, description: 'Complete basement/main floor waterproofing & trims' },
    ],
  },
};

const SQFT_PRESETS = [500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 3500, 4000];

export default function FlooringEstimator() {
  const { setQuoteModalOpen } = useCart();

  // Selected values matching the old site fields
  const [sqft, setSqft] = useState<number>(1000);
  const [isCustomSqft, setIsCustomSqft] = useState<boolean>(false);
  const [customSqftInput, setCustomSqftInput] = useState<string>('1000');

  const [flooringType, setFlooringType] = useState<string>('Hardwood');
  const [quality, setQuality] = useState<'Good' | 'Better' | 'Best'>('Better');
  const [serviceIndex, setServiceIndex] = useState<number>(1); // Default to 'Install'

  // Service options available for selected flooring type & quality
  const availableServices = useMemo(() => {
    const typeGroup = ESTIMATOR_MATRIX[flooringType] || ESTIMATOR_MATRIX['Hardwood'];
    return typeGroup[quality] || typeGroup['Better'];
  }, [flooringType, quality]);

  // Current selected service option & rate
  const selectedService = availableServices[serviceIndex] || availableServices[0];
  const ratePerSqFt = selectedService.price;

  // Calculation
  const estimatedTotal = useMemo(() => {
    return Math.round(sqft * ratePerSqFt * 100) / 100;
  }, [sqft, ratePerSqFt]);

  const handlePresetClick = (preset: number) => {
    setSqft(preset);
    setIsCustomSqft(false);
    setCustomSqftInput(preset.toString());
  };

  const handleCustomSqftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomSqftInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSqft(parsed);
    }
  };

  return (
    <section id="estimator-section" className="py-12 sm:py-20 bg-[#0b1026] text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1212ff]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#ff0000]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1212ff]/20 border border-[#1212ff]/40 text-[#8585ff] text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-4 h-4 text-[#ff0000]" />
            <span>Moga Carpet &amp; Flooring Official Estimator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Calculate Your Instant Flooring Cost
          </h2>
          <p className="mt-3 text-stone-300 text-sm sm:text-base font-light">
            Select your square footage, flooring type, quality tier, and service level to see your factory-direct quote instantly.
          </p>
        </div>

        {/* Main Estimator Card */}
        <div className="bg-[#121838]/95 border border-[#1e2756] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* Left Inputs (7 cols) */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. Square Footage Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#ff0000] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    <span>Select Square Footage</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSqft(!isCustomSqft)}
                    className="text-xs font-semibold text-[#8585ff] hover:text-white underline cursor-pointer"
                  >
                    {isCustomSqft ? 'Use Presets' : 'Enter Custom Area'}
                  </button>
                </div>

                {!isCustomSqft ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {SQFT_PRESETS.map((preset) => {
                      const isSelected = sqft === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1212ff] text-white shadow-md shadow-blue-500/25 border border-[#4d4dff]'
                              : 'bg-[#182046] hover:bg-[#202b5e] text-stone-300 border border-[#27336e]'
                          }`}
                        >
                          {preset.toLocaleString()} sq ft
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="50"
                        max="50000"
                        value={customSqftInput}
                        onChange={handleCustomSqftChange}
                        placeholder="e.g. 1250"
                        className="w-full bg-[#182046] border border-[#27336e] rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#1212ff]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">sq ft</span>
                    </div>
                    <span className="text-xs text-stone-400">({(sqft / 9).toFixed(1)} sq yards)</span>
                  </div>
                )}
              </div>

              {/* 2. Type of Flooring */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#ff0000] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  <span>Type of Flooring</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.keys(ESTIMATOR_MATRIX).map((type) => {
                    const isSelected = flooringType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFlooringType(type)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1212ff]/20 border-[#1212ff] text-white shadow-md'
                            : 'bg-[#182046]/60 border-[#27336e] text-stone-300 hover:bg-[#182046]'
                        }`}
                      >
                        <span className="text-xs font-bold">{type}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#4d4dff]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Quality of Floor */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#ff0000] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                  <span>Quality of Floor</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Good', 'Better', 'Best'] as const).map((q) => {
                    const isSelected = quality === q;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#1212ff] to-[#4d4dff] text-white font-bold border-[#4d4dff] shadow-md'
                            : 'bg-[#182046]/60 border-[#27336e] text-stone-300 hover:bg-[#182046]'
                        }`}
                      >
                        <div className="text-xs font-bold">{q}</div>
                        <div className="text-[10px] text-stone-300 mt-0.5">
                          {q === 'Good' ? 'Standard Tier' : q === 'Better' ? 'Popular / High Value' : 'Luxury / Premium'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Level of Service */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 mb-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#ff0000] text-white text-[11px] font-bold flex items-center justify-center">4</span>
                  <span>Level of Service</span>
                </label>
                <div className="space-y-2">
                  {availableServices.map((srv, idx) => {
                    const isSelected = serviceIndex === idx;
                    return (
                      <div
                        key={srv.name}
                        onClick={() => setServiceIndex(idx)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#182046] border-[#1212ff] ring-1 ring-[#1212ff] shadow-md'
                            : 'bg-[#182046]/40 border-[#27336e] hover:bg-[#182046]/70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="estimator-service"
                            checked={isSelected}
                            onChange={() => setServiceIndex(idx)}
                            className="mt-1 accent-[#ff0000] cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{srv.name}</span>
                              {srv.name === 'Install' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                                  Most Popular
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">{srv.description}</p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 pl-3">
                          <span className="text-sm font-black text-[#8585ff]">${srv.price.toFixed(2)}</span>
                          <span className="text-[10px] text-stone-400 block">/ sq ft</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Summary Card (5 cols) */}
            <div className="lg:col-span-5 bg-[#182046] border border-[#27336e] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#27336e]/80">
                  <span className="text-xs uppercase tracking-wider font-bold text-stone-400">
                    Estimate Summary
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Direct Wholesale Price
                  </span>
                </div>

                {/* Scope Breakdown */}
                <div className="py-4 space-y-2.5 text-xs text-stone-300 border-b border-[#27336e]/60">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Total Area:</span>
                    <span className="font-bold text-white">{sqft.toLocaleString()} sq ft ({(sqft / 9).toFixed(1)} sq yd)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Flooring Type:</span>
                    <span className="font-bold text-white">{flooringType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Quality Tier:</span>
                    <span className="font-bold text-white">{quality} Tier</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Service Level:</span>
                    <span className="font-bold text-white">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Unit Rate:</span>
                    <span className="font-bold text-[#8585ff]">${ratePerSqFt.toFixed(2)} / sq ft</span>
                  </div>
                </div>

                {/* Big Cost Display */}
                <div className="pt-6 pb-6 text-center lg:text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#ff4d4d] block mb-1">
                    Approximate Cost
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#8585ff] to-[#ff4d4d]">
                    ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-2">
                    *Taxes extra. Final measurement confirmed on-site before any invoice.
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Book Free In-Home Measurement</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="tel:19058482222"
                  className="w-full py-3 px-6 rounded-xl text-xs font-bold text-white border border-[#1212ff] bg-[#1212ff]/20 hover:bg-[#1212ff]/40 transition-all flex items-center justify-center gap-2 text-center"
                >
                  <PhoneCall className="w-4 h-4 text-[#8585ff]" />
                  <span>Call / Text: (905) 848-2222</span>
                </a>

                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 text-center pt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4d4dff]" />
                  <span>100% Free Consultation Across the GTA • Zero Obligation</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
