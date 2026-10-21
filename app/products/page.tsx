import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductsClient from './ProductsClient';
import { query } from '@/lib/db';

export const metadata: Metadata = {
  title: 'All Flooring Products & Category Collections | Moga Carpet & Flooring',
  description: 'Browse all categories of residential carpets, commercial carpet tiles, 100% waterproof luxury vinyl planks, and designer area rugs at Moga Carpet Brampton.',
};

export default async function ProductsPage() {
  let initialProducts: any[] = [];
  let initialTotal = 0;

  try {
    const productsRows = await query<any[]>(`
      SELECT id, name, slug, sku, category_id, category_label, price, regular_price, sale_price, unit, rating, reviews_count, badge, in_stock, image
      FROM products
      WHERE in_stock = 1 AND (is_visible IS NULL OR is_visible = 1)
      ORDER BY id DESC
      LIMIT 20
    `);

    const countRows = await query<any[]>(`
      SELECT COUNT(*) as total FROM products WHERE in_stock = 1 AND (is_visible IS NULL OR is_visible = 1)
    `);

    initialProducts = productsRows.map(p => ({
      ...p,
      price: Number(p.price) || 0,
      regular_price: p.regular_price ? Number(p.regular_price) : null,
      sale_price: p.sale_price ? Number(p.sale_price) : null,
      rating: Number(p.rating) || 5,
      reviews_count: Number(p.reviews_count) || 0,
      in_stock: Number(p.in_stock) || 1,
    }));
    initialTotal = countRows[0]?.total || 0;
  } catch (err) {
    console.error('Failed to pre-fetch products:', err);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ProductsClient initialProducts={initialProducts} initialTotal={initialTotal} />
      </main>
      <Footer />
    </>
  );
}
