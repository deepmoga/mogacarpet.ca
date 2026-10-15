'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Truck,
  Sparkles
} from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#0b1026] text-stone-300 pt-16 pb-12 border-t border-[#182046]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter & Promo Banner */}
        <div className="bg-[#121838] border border-[#27336e] rounded-3xl p-8 sm:p-10 mb-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff0000] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VIP Flooring Club</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Get $50 Off Your First Order Over $500
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm max-w-lg">
              Subscribe to receive exclusive warehouse roll specials, designer rug promotions, and seasonal flooring clearance alerts.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>You're subscribed! Use promo code <strong>MOGA50</strong> at consultation.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0b1026] border border-[#27336e] rounded-xl px-4 py-3 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#1212ff] flex-1 min-w-[240px]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white font-bold text-xs transition-colors whitespace-nowrap shadow-md"
                >
                  Claim $50 Voucher
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-[#182046]">
          
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-14 w-56">
                <Image
                  src="/images/cropped-web-logo-moga-carpet-flooring-5.png"
                  alt="Moga Carpet & Flooring"
                  fill
                  className="object-contain object-left brightness-110"
                />
              </div>
            </Link>

            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Your one stop flooring shop in Brampton, ON. Supplying premium residential and commercial broadloom carpets, waterproof luxury vinyl planks, hand-knotted area rugs, and Canadian hardwood with certified installation.
            </p>

            <div className="space-y-2.5 text-xs text-stone-300 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#4d4dff] flex-shrink-0 mt-0.5" />
                <span>1-8550 Torbram Road, Brampton ON, Canada (Second Floor)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ff4d4d] flex-shrink-0" />
                <a href="tel:19058482222" className="hover:text-white font-semibold transition-colors">
                  1-905-848-2222 (Call or Text)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#4d4dff] flex-shrink-0" />
                <span>Mon - Sat: 11:00 AM – 5:00 PM (Preferred by Appointment)</span>
              </div>
            </div>
          </div>

          {/* Department Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8585ff]">
              Flooring Departments
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8585ff]">
              Featured Collections
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link href="/products?search=Joy%20Carpets" className="hover:text-white transition-colors">Joy Carpets Fluorescent</Link></li>
              <li><Link href="/products?search=Ancient%20Garden" className="hover:text-white transition-colors">Ancient Garden Persian Rugs</Link></li>
              <li><Link href="/products?search=Vinyl" className="hover:text-white transition-colors">Commercial Click SPC & LVT</Link></li>
              <li><Link href="/products?search=Stonewall" className="hover:text-white transition-colors">Stonewall Modular Tiles</Link></li>
              <li><Link href="/category/underpad" className="hover:text-white transition-colors">10mm High-Density Rebond Pad</Link></li>
              <li><Link href="/category/underpad" className="hover:text-white transition-colors">12mm Memory Foam Padding</Link></li>
              <li><Link href="/category/stair-runner" className="hover:text-white transition-colors">Custom Stair Runners</Link></li>
            </ul>
          </div>

          {/* Services & GTA Coverage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8585ff]">
              Quick Links & Services
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products & Categories</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Moga Carpet</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Showroom & Contact Us</Link></li>
              <li><a href="/#estimator-section" className="hover:text-white transition-colors">Instant Flooring Estimator</a></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Book Showroom Appointment</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Certified GTA Installation</Link></li>
              <li><a href="https://maps.app.goo.gl/8pBrk8d4sy7C9vvG8" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Google Maps Directions ↗</a></li>
            </ul>

            <div className="pt-3">
              <span className="text-[11px] font-bold text-stone-300 block mb-1">Serving Greater Toronto:</span>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                Brampton, Mississauga, Toronto, Vaughan, Caledon, Oakville, Milton, Georgetown, Markham.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Security */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} Moga Carpet & Flooring. All rights reserved. Your One Stop Flooring Shop.
          </div>

          <div className="flex items-center space-x-4 text-stone-400">
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>SSL 256-bit Encrypted Checkout</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-[#ff4d4d]" />
              <span>GTA Express Delivery</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
