import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopClient from '@/app/shop/ShopClient';
import { CATEGORIES } from '@/data/categories';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find(c => c.slug === slug || c.id === slug);

  if (!cat) {
    return { title: 'Category | Moga Carpet & Flooring Brampton' };
  }

  return {
    title: `${cat.name} | Moga Carpet & Flooring Brampton`,
    description: cat.description,
    openGraph: {
      title: `${cat.name} | Moga Carpet & Flooring`,
      description: cat.description,
      images: [{ url: cat.image }],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const cat = CATEGORIES.find(c => c.slug === slug || c.id === slug);

  if (!cat) {
    notFound();
  }

  // Pre-fetch products for this category from MySQL
  let initialProducts: any[] = [];
  let total = 0;

  try {
    const [countRes] = await query<any[]>(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ? OR category_label LIKE ?;',
      [cat.id, `%${cat.name}%`]
    );
    total = countRes?.total || 0;

    initialProducts = await query<any[]>(
      'SELECT id, name, slug, category_id, category_label, price, regular_price, sale_price, unit, rating, reviews_count, badge, in_stock, image, colors FROM products WHERE category_id = ? OR category_label LIKE ? ORDER BY created_at DESC LIMIT 24;',
      [cat.id, `%${cat.name}%`]
    );
  } catch (err) {
    console.error('Failed to pre-fetch category products:', err);
  }

  const initialPagination = {
    total,
    page: 1,
    limit: 24,
    totalPages: Math.ceil(total / 24),
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50">
      <Navbar />
      
      {/* Category Hero Banner */}
      <div className="bg-[#0b1026] text-white py-12 border-b border-[#182046]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ff0000] text-white">
              {cat.badge || 'Department Collection'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {cat.name}
            </h1>
            <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed">
              {cat.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-[#8585ff] pt-2">
              <span className="font-bold">{total} Styles in Database</span>
              <span>•</span>
              <span>50,000 Sq Ft Warehouse In Brampton</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-stone-500">Loading department products...</div>}>
          <ShopClient
            initialProducts={initialProducts}
            initialPagination={initialPagination}
            initialCategory={cat.id}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
