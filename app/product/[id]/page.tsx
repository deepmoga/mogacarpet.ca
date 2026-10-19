import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { query } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetailsClient from './ProductDetailsClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const rows = await query<any[]>('SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1;', [id, id]);
  
  if (!rows || rows.length === 0) {
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

  const isCarpetCategory =
    rawProd.category_id === 'carpets' ||
    rawProd.category_id === 'carpet-tiles' ||
    (rawProd.category_label && rawProd.category_label.toLowerCase().includes('carpet'));

  let displayUnit = rawProd.unit;
  if (isCarpetCategory && (!displayUnit || displayUnit.toLowerCase().includes('yd'))) {
    displayUnit = 'sq. ft.';
  } else if (!displayUnit) {
    displayUnit = isCarpetCategory ? 'sq. ft.' : 'sq. yd.';
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

  // Fetch 4 related products from the same category
  const rawRelatedRows = await query<any[]>(
    'SELECT id, name, slug, price, unit, image, badge, category_id, category_label FROM products WHERE category_id = ? AND id != ? ORDER BY id DESC LIMIT 4;',
    [product.category_id, product.id]
  );

  const relatedProducts = (rawRelatedRows || []).map((rel) => {
    const isRelCarpet =
      rel.category_id === 'carpets' ||
      rel.category_id === 'carpet-tiles' ||
      (rel.category_label && rel.category_label.toLowerCase().includes('carpet'));
    let relUnit = rel.unit;
    if (isRelCarpet && (!relUnit || relUnit.toLowerCase().includes('yd'))) {
      relUnit = 'sq. ft.';
    }
    return {
      ...rel,
      unit: relUnit || (isRelCarpet ? 'sq. ft.' : 'sq. yd.'),
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
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
