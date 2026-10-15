import React from 'react';
import { Ruler, DollarSign, Warehouse, Award, Droplets, Truck } from 'lucide-react';

const BADGES = [
  {
    icon: Ruler,
    title: 'Free In-Home Measurement',
    desc: 'Expert technicians bring real carpet & vinyl samples directly to your doorstep.',
  },
  {
    icon: DollarSign,
    title: 'Direct Mill Pricing',
    desc: 'Skip the middleman markup. Enjoy true wholesale pricing on top Canadian brands.',
  },
  {
    icon: Warehouse,
    title: '50,000 Sq Ft Local Warehouse',
    desc: 'Massive in-stock selection in Brampton ready for immediate pickup or delivery.',
  },
  {
    icon: Award,
    title: 'Certified Installation',
    desc: 'Experienced in-house master installers with full workmanship warranty.',
  },
  {
    icon: Droplets,
    title: '100% Waterproof SPC',
    desc: 'Pet-proof, kid-proof, and commercial-grade waterproof luxury vinyl flooring.',
  },
  {
    icon: Truck,
    title: 'Fast GTA Delivery',
    desc: 'Prompt distribution throughout Toronto, Brampton, Mississauga, and beyond.',
  },
];

export default function TrustBadges() {
  return (
    <section className="bg-white border-b border-stone-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div 
                key={idx} 
                className="flex flex-col items-center text-center p-3 rounded-2xl hover:bg-stone-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-[#1212ff] border border-blue-200/70 flex items-center justify-center text-[#1212ff] group-hover:text-white mb-3 transition-all duration-300 shadow-sm">
                  <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-1 leading-snug">
                  {badge.title}
                </h3>
                <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                  {badge.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
