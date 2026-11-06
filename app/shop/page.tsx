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

interface ShopPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search.trim() : '';
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category.trim() : '';
  const stock = typeof resolvedSearchParams.stock === 'string' ? resolvedSearchParams.stock.trim() : '';
  const sortBy = typeof resolvedSearchParams.sortBy === 'string' ? resolvedSearchParams.sortBy.trim() : 'newest';

  // Pre-fetch initial page 1 from MySQL with filters
  let initialProducts: any[] = [];
  let total = 0;

  try {
    const whereClauses: string[] = ['(is_visible IS NULL OR is_visible = 1)'];
    const sqlParams: any[] = [];

    if (search) {
      whereClauses.push('(name LIKE ? OR sku LIKE ? OR category_label LIKE ? OR short_description LIKE ?)');
      const wild = `%${search}%`;
      sqlParams.push(wild, wild, wild, wild);
    }

    if (category && category !== 'all') {
      whereClauses.push('(category_id = ? OR category_label LIKE ?)');
      sqlParams.push(category, `%${category}%`);
    }

    if (stock === 'instock' || stock === 'in_stock') {
      whereClauses.push('in_stock = 1');
    } else if (stock === 'outofstock' || stock === 'out_of_stock') {
      whereClauses.push('in_stock = 0');
    }

    const whereSql = whereClauses.join(' AND ');

    let orderSql = 'created_at DESC';
    if (sortBy === 'price_asc') orderSql = 'price ASC';
    else if (sortBy === 'price_desc') orderSql = 'price DESC';
    else if (sortBy === 'name_asc') orderSql = 'name ASC';

    const [countRes] = await query<any[]>(
      `SELECT COUNT(*) as total FROM products WHERE ${whereSql};`,
      sqlParams
    );
    total = countRes?.total || 0;

    initialProducts = await query<any[]>(
      `SELECT id, name, slug, category_id, category_label, price, regular_price, sale_price, unit, rating, reviews_count, badge, in_stock, image, colors FROM products WHERE ${whereSql} ORDER BY ${orderSql} LIMIT 24;`,
      sqlParams
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
            initialCategory={category}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
