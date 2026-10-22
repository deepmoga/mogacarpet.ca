import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetailsClient from './ProductDetailsClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function checkAdminAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!token) return false;
    const payload = verifyToken(token);
    return payload?.role === 'admin';
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const rows = await query<any[]>('SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1;', [id, id]);
  
  if (!rows || rows.length === 0 || (rows[0].is_visible === 0 && !(await checkAdminAuth()))) {
    return {
      title: 'Product Not Found | Moga Carpet & Flooring Brampton',
    };
  }

  const prod = rows[0];
  return {
    title: `${prod.name} | Moga Carpet & Flooring Brampton`,
    description: prod.short_description || `Buy ${prod.name} with factory direct wholesale pricing, certified master installation, and Brampton warehouse delivery across the GTA.`,
    openGraph: {
      title: `${prod.name} | Moga Carpet & Flooring`,
      description: `Buy ${prod.name} with direct mill pricing and certified installation across the GTA.`,
      images: [
        {
          url: prod.image,
          width: 800,
          height: 600,
          alt: prod.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const rows = await query<any[]>('SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1;', [id, id]);

  if (!rows || rows.length === 0) {
    notFound();
  }

  const rawProd = rows[0];
  const isAdmin = await checkAdminAuth();

  // If status is OFF and visitor is not authenticated as admin, return 404 Not Found
  if (rawProd.is_visible === 0 && !isAdmin) {
    notFound();
  }

  // Parse gallery images
  let galleryImages: string[] = [];
  try {
    galleryImages = rawProd.gallery_images ? (typeof rawProd.gallery_images === 'string' ? JSON.parse(rawProd.gallery_images) : rawProd.gallery_images) : [];
  } catch {
    galleryImages = [];
  }

  // Parse colors
  let colors: any[] = [];
  try {
    colors = rawProd.colors ? (typeof rawProd.colors === 'string' ? JSON.parse(rawProd.colors) : rawProd.colors) : [];
  } catch {
    colors = [];
  }

  // Parse specs
  let specs: any = [];
  try {
    specs = rawProd.specs ? (typeof rawProd.specs === 'string' ? JSON.parse(rawProd.specs) : rawProd.specs) : [];
  } catch {
    specs = [];
  }

  // Parse features
  let features: string[] = [];
  try {
    features = rawProd.features ? (typeof rawProd.features === 'string' ? JSON.parse(rawProd.features) : rawProd.features) : [];
  } catch {
    features = [];
  }

  let displayUnit = rawProd.unit;
  if (!displayUnit || displayUnit.toLowerCase().includes('yd')) {
    displayUnit = 'sq. ft.';
  }

  const product = {
    id: String(rawProd.id),
    name: rawProd.name,
    slug: rawProd.slug,
    sku: rawProd.sku || null,
    category_id: rawProd.category_id || 'carpets',
    category_label: rawProd.category_label || 'Carpets & Broadloom',
    price: parseFloat(rawProd.price) || 0,
    regular_price: rawProd.regular_price ? parseFloat(rawProd.regular_price) : null,
    sale_price: rawProd.sale_price ? parseFloat(rawProd.sale_price) : null,
    unit: displayUnit,
    rating: parseFloat(rawProd.rating) || 5.0,
    reviews_count: rawProd.reviews_count || 18,
    badge: rawProd.badge || null,
    in_stock: rawProd.in_stock ? 1 : 0,
    image: rawProd.image || '/images/slide01.jpg',
    gallery_images: Array.isArray(galleryImages) ? galleryImages : [],
    colors: Array.isArray(colors) ? colors : [],
    description: rawProd.description || '',
    short_description: rawProd.short_description || '',
    specs,
    features,
  };

  // Fetch 4 related products from the same category (only active/visible products)
  const rawRelatedRows = await query<any[]>(
    'SELECT id, name, slug, price, unit, image, badge, category_id, category_label FROM products WHERE category_id = ? AND id != ? AND (is_visible IS NULL OR is_visible = 1) ORDER BY id DESC LIMIT 4;',
    [product.category_id, product.id]
  );

  const relatedProducts = (rawRelatedRows || []).map((rel) => {
    let relUnit = rel.unit;
    if (!relUnit || relUnit.toLowerCase().includes('yd')) {
      relUnit = 'sq. ft.';
    }
    return {
      ...rel,
      unit: relUnit,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      {rawProd.is_visible === 0 && (
        <div className="bg-amber-500 text-white text-xs font-bold py-2.5 px-4 text-center tracking-wide shadow-sm flex items-center justify-center gap-2">
          <span>⚠️ ADMIN PREVIEW: This product status is currently OFF (Hidden from the storefront). Public visitors cannot access this page.</span>
        </div>
      )}
      <main className="flex-1">
        <ProductDetailsClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </main>
      <Footer />
    </div>
  );
}
