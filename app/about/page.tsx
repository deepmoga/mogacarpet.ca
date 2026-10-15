import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ShieldCheck, 
  Award, 
  Truck, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Moga Carpet & Flooring Brampton ON',
  description: 'Learn about Moga Carpet & Flooring. Brampton’s premier wholesale and retail destination for broadloom carpets, waterproof vinyl planks, and luxury area rugs.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-stone-50 min-h-screen">
        
        {/* Hero Banner */}
        <section className="relative bg-[#0b1026] text-white py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/slide01.jpg"
              alt="Moga Carpet Brampton Warehouse"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1026] via-[#0b1026]/90 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff0000]/20 border border-[#ff0000]/60 text-white text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#ff4d4d]" />
                <span>Canada’s Trusted Flooring Specialists</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Crafting Beautiful Floors Across Ontario for Over 20 Years
              </h1>
              <p className="text-stone-300 text-sm sm:text-lg font-light leading-relaxed">
                From luxury residential broadloom to heavy-duty commercial carpet tiles and waterproof vinyl planks, Moga Carpet & Flooring combines mill-direct wholesale pricing with master certified installation.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200">
            <div className="text-center p-3 border-r border-stone-100 last:border-0">
              <span className="text-3xl sm:text-4xl font-black text-[#1212ff] block">20+</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Years in Business</span>
            </div>
            <div className="text-center p-3 border-r border-stone-100 last:border-0">
              <span className="text-3xl sm:text-4xl font-black text-[#ff0000] block">15,000+</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">GTA Homes & Offices</span>
            </div>
            <div className="text-center p-3 border-r border-stone-100 last:border-0">
              <span className="text-3xl sm:text-4xl font-black text-[#1212ff] block">1,300+</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">In-Stock Styles</span>
            </div>
            <div className="text-center p-3">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 block">50k Sq Ft</span>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Brampton Warehouse</span>
            </div>
          </div>
        </section>

        {/* Story & Philosophy */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#ff0000] uppercase tracking-wider">
                  Our Legacy & Commitment
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  Your One-Stop Flooring Destination in Brampton
                </h2>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed">
                Founded with a vision to eliminate middleman retail markups, <strong>Moga Carpet & Flooring</strong> has grown into one of the largest independent flooring distributors in Ontario. Operating from our expansive facility at <strong>8550 Torbram Road, Brampton</strong>, we warehouse thousands of rolls and pallets ready for immediate GTA dispatch.
              </p>

              <p className="text-stone-600 text-sm leading-relaxed">
                We take immense pride in stocking Canada’s most distinctive commercial collections—including fluorescent print carpets by <strong>Joy Carpets USA</strong>, designer wool-blend area rugs, commercial acoustic tiles, and heavy wear-layer rigid core SPC vinyl planks designed to withstand Canadian winter moisture and heavy foot traffic.
              </p>

              {/* Pillars */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1212ff] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Direct From The Mills</h4>
                    <p className="text-xs text-stone-500">We buy directly from top Canadian, American, and European mills, passing wholesale savings to homeowners and builders.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#ff0000] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Certified Professional Installation</h4>
                    <p className="text-xs text-stone-500">Our in-house master installers handle subfloor prep, precision carpet seaming, stair runners, and commercial glue-down.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1212ff] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Free In-Home Measurement & Estimates</h4>
                    <p className="text-xs text-stone-500">We bring actual flooring samples directly to your doorstep across Brampton, Mississauga, Toronto, and Vaughan.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="px-6 py-3 rounded-full bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  <span>Browse Product Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-full border border-[#1212ff] text-[#1212ff] hover:bg-blue-50 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <span>Visit Brampton Showroom</span>
                </Link>
              </div>
            </div>

            {/* Right Images Collage */}
            <div className="relative">
              <div className="relative h-[420px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
                <Image
                  src="/images/slide02.jpg"
                  alt="Moga Carpet Showroom"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Float Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-stone-200 max-w-xs hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-[#1212ff]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">100% Satisfaction</span>
                    <span className="text-[11px] text-stone-500">Direct Mill Warranties on all carpet and flooring products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Warehouse & Services Pillars */}
        <section className="bg-white py-16 sm:py-24 border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold text-[#1212ff] uppercase tracking-wider">
                Full-Service Flooring Experience
              </span>
              <h2 className="text-3xl font-black text-stone-900 tracking-tight">
                Why GTA Homeowners & Builders Choose Us
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm">
                From initial sample selection to precision cutting and final cleanup, we manage every step with seasoned care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1212ff] flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Broadest Range in GTA</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Over 1,300 unique carpet patterns, solid hardwood planks, engineered wire-brushed oak, porcelain tiles, and custom bound stair runners.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#ff0000] flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">GTA Fast Express Dispatch</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  We deliver directly to job sites, commercial offices, hotels, and residences across Toronto, Brampton, Mississauga, and surrounding regions.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Price Match Assurance</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Bring us any certified quote in Ontario on equivalent carpet rolls or SPC vinyl planks—we will meet or beat legitimate competitor pricing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Bar */}
        <section className="bg-[#0b1026] text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Ready to renovate your floors?</h3>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">Visit our showroom or call (905) 848-2222 to schedule a free measurement.</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="tel:19058482222"
                className="px-6 py-3 rounded-full bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call (905) 848-2222</span>
              </a>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-full bg-[#1212ff] hover:bg-[#0a0ad8] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
