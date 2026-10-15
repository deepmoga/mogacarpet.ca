'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Layers } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

export default function CategoryGrid() {
  return (
    <section id="categories-section" className="py-16 sm:py-24 bg-stone-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1212ff] text-xs font-bold uppercase tracking-wider mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Explore By Department</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Curated Flooring Solutions
            </h2>
            <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-xl">
              From ultra-soft residential carpets and heirloom oriental rugs to 100% waterproof commercial SPC vinyl.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1212ff] hover:text-[#ff0000] transition-colors"
            >
              <span>Browse All 1,300+ In Shop Catalog</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              id={cat.id}
              className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              {/* Category Image */}
              <Link href={`/category/${cat.id}`} className="block relative h-64 w-full overflow-hidden bg-stone-100">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1026]/85 via-[#0b1026]/25 to-transparent" />

                {/* Badge */}
                {cat.badge && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#ff0000] text-white shadow-sm">
                      {cat.badge}
                    </span>
                  </div>
                )}

                {/* Count badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0b1026]/80 text-[#ff4d4d] backdrop-blur-md border border-stone-700">
                    {cat.itemCount}
                  </span>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#8585ff] transition-colors flex items-center justify-between">
                    <span>{cat.name}</span>
                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#ff0000] group-hover:text-white transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </h3>
                </div>
              </Link>

              {/* Category Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  {/* Subcategory Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cat.subcategories.slice(0, 4).map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/shop?category=${cat.id}&search=${encodeURIComponent(sub.name)}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-blue-50 hover:text-[#1212ff] transition-colors font-medium"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    {cat.subcategories.length > 4 && (
                      <Link
                        href={`/category/${cat.id}`}
                        className="text-[11px] px-2 py-1 rounded-lg bg-stone-50 text-stone-500 hover:text-[#1212ff] font-medium"
                      >
                        +{cat.subcategories.length - 4} more
                      </Link>
                    )}
                  </div>
                </div>

                {/* Card CTA */}
                <Link
                  href={`/category/${cat.id}`}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-stone-800 bg-stone-100 group-hover:bg-[#1212ff] group-hover:text-white transition-all text-center"
                >
                  <span>Explore {cat.name.split(' ')[0]} Catalog</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
