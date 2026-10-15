'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Truck, Clock, Sparkles, CheckCircle2, PhoneCall } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function WhyChooseUs() {
  const { setQuoteModalOpen } = useCart();

  return (
    <section id="about-section" className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Collage with original site images */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              
              {/* Image 1 */}
              <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-xl border-2 border-blue-100">
                <Image
                  src="/images/slide01.jpg"
                  alt="Luxury Carpet Living Room"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Image 2 */}
              <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-xl border-2 border-blue-100 mt-8">
                <Image
                  src="/images/slide02.jpg"
                  alt="High Traffic Commercial Flooring"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -bottom-6 left-6 z-20 bg-[#0b1026] text-white p-5 rounded-2xl shadow-2xl border border-[#182046] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ff0000] flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-md">
                20+
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Years of Craftsmanship</h4>
                <p className="text-[11px] text-stone-400">Serving Brampton & GTA Homes</p>
              </div>
            </div>

            {/* Background ambient decorative circle */}
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl -z-10" />
          </div>

          {/* Right Column: Editorial & Reasons */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1212ff] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#ff0000]" />
              <span>The Moga Carpet & Flooring Difference</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Canada’s Direct Mill Destination For Quality Flooring
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              At <strong className="text-stone-900 font-semibold">Moga Carpet & Flooring</strong>, we eliminate retail markups by importing directly from top American and Canadian mills. Whether you require commercial loop carpet for an office building, custom stair runners, or waterproof luxury vinyl planks for your home, our Brampton showroom and 50,000 sq ft warehouse have it ready for you today.
            </p>

            {/* Key Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-blue-200 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-[#1212ff] mb-2" />
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm">In-Stock GTA Warehouse</h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  Over 1,300 carpet styles and SPC vinyl designs available immediately without long factory delays.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-blue-200 transition-colors">
                <ShieldCheck className="w-5 h-5 text-[#1212ff] mb-2" />
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Certified Master Installers</h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  Clean, insured in-house teams. We handle removal of old flooring, subfloor prep, and clean disposal.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-blue-200 transition-colors">
                <Clock className="w-5 h-5 text-[#1212ff] mb-2" />
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Custom Binding & Runners</h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  On-site workshop to customize stair runners, oval rugs, and edge serging to your exact room specs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-blue-200 transition-colors">
                <Truck className="w-5 h-5 text-[#1212ff] mb-2" />
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Mobile Sample Showroom</h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  Too busy to visit? Our design specialists bring 100+ physical samples directly to your residence.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] shadow-md hover:shadow-lg transition-all"
              >
                Schedule In-Home Consultation
              </button>

              <a
                href="tel:19058482222"
                className="inline-flex items-center text-xs sm:text-sm font-bold text-stone-900 hover:text-[#1212ff] transition-colors"
              >
                <PhoneCall className="w-4 h-4 mr-2 text-[#ff0000]" />
                <span>Call or Text: (905) 848-2222</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
