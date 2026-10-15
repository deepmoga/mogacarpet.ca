import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { query } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Shop All Flooring | 1,300+ Carpets, Rugs & Vinyl | Moga Carpet Brampton',
  description: 'Browse Canada’s premier online flooring catalog. Over 1,300 commercial broadloom carpets, waterproof luxury vinyl tiles, and oriental area rugs in stock in Brampton, ON.',
};

export default async function ShopPage() {
  // Pre-fetch initial page 1 from MySQL
  let initialProducts: any[] = [];
  let total = 0;

  try {
    const [countRes] = await query<any[]>('SELECT COUNT(*) as total FROM products WHERE in_stock = 1 OR is_visible = 1;');
    total = countRes?.total || 0;

    initialProducts = await query<any[]>(
      'SELECT id, name, slug, category_id, category_label, price, regular_price, sale_price, unit, rating, reviews_count, badge, in_stock, image, colors FROM products ORDER BY created_at DESC LIMIT 24;'
    );
  } catch (err) {
    console.error('Failed to pre-fetch shop products:', err);
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
      <main className="flex-1">
        <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-stone-500">Loading catalog...</div>}>
          <ShopClient
            initialProducts={initialProducts}
            initialPagination={initialPagination}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
