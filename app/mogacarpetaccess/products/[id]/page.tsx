import React from 'react';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import EditProductClient from './EditProductClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const rows = await query<any[]>('SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1;', [id, id]);

  if (!rows || rows.length === 0) {
    notFound();
  }

  const rawProd = rows[0];

  // Serialize raw product
  const product = {
    ...rawProd,
    id: String(rawProd.id),
    price: rawProd.price ? parseFloat(rawProd.price) : 0,
    regular_price: rawProd.regular_price ? parseFloat(rawProd.regular_price) : null,
    sale_price: rawProd.sale_price ? parseFloat(rawProd.sale_price) : null,
    in_stock: rawProd.in_stock ? 1 : 0,
    is_featured: rawProd.is_featured ? 1 : 0,
    is_visible: rawProd.is_visible !== 0 ? 1 : 0,
  };

  return <EditProductClient productId={String(rawProd.id)} initialProduct={product} />;
}
