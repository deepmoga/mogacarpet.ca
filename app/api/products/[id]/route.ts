import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload?.role === 'admin';
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await query<any[]>('SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1;', [id, id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: rows[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function cleanSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    const name = data.name?.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const slug = data.slug ? cleanSlug(data.slug) : cleanSlug(name) + '-' + id;
    const price = parseFloat(data.price) || 0.00;
    const regularPrice = data.regular_price ? parseFloat(data.regular_price) : null;
    const salePrice = data.sale_price ? parseFloat(data.sale_price) : null;
    const inStock = data.in_stock ? 1 : 0;
    const isFeatured = data.is_featured ? 1 : 0;
    const isVisible = data.is_visible !== undefined ? (data.is_visible ? 1 : 0) : 1;
    const categoryId = data.category_id || 'carpets';
    const categoryLabel = data.category_label || 'Carpets & Broadloom';
    const isCarpet = categoryId.includes('carpet');
    const unit = data.unit || (isCarpet ? 'sq. ft.' : 'sq. yd.');
    const image = data.image || null;
    const galleryImages = data.gallery_images !== undefined ? (typeof data.gallery_images === 'string' ? data.gallery_images : JSON.stringify(data.gallery_images)) : null;
    const colors = data.colors !== undefined ? (typeof data.colors === 'string' ? data.colors : JSON.stringify(data.colors)) : null;
    const specs = data.specs !== undefined ? (typeof data.specs === 'string' ? data.specs : JSON.stringify(data.specs)) : null;
    const features = data.features !== undefined ? (typeof data.features === 'string' ? data.features : JSON.stringify(data.features)) : null;
    const description = data.description || '';
    const shortDescription = data.short_description || '';
    const badge = data.badge || null;
    const sku = data.sku || null;

    await query(`
      UPDATE products SET
        name = ?,
        slug = ?,
        sku = ?,
        category_id = ?,
        category_label = ?,
        price = ?,
        regular_price = ?,
        sale_price = ?,
        unit = ?,
        badge = ?,
        in_stock = ?,
        is_featured = ?,
        is_visible = ?,
        image = COALESCE(?, image),
        gallery_images = COALESCE(?, gallery_images),
        colors = COALESCE(?, colors),
        description = ?,
        short_description = ?,
        specs = COALESCE(?, specs),
        features = COALESCE(?, features),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `, [
      name, slug, sku, categoryId, categoryLabel,
      price, regularPrice, salePrice, unit, badge,
      inStock, isFeatured, isVisible,
      image, galleryImages, colors,
      description, shortDescription,
      specs, features,
      id
    ]);

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await query('DELETE FROM products WHERE id = ?;', [id]);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
