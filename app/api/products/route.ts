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

function cleanSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const stock = searchParams.get('stock')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all';
    const isAdminReq = searchParams.get('admin') === 'true';
    const isAuth = isAdminReq ? await checkAdminAuth() : false;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const sortBy = searchParams.get('sortBy') || 'newest';
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ['1=1'];
    const params: any[] = [];

    // Storefront vs Admin Visibility Filter
    if (isAuth) {
      if (status === 'active') {
        whereClauses.push('(is_visible IS NULL OR is_visible = 1)');
      } else if (status === 'off') {
        whereClauses.push('is_visible = 0');
      }
      // If status === 'all', show all items (both On and Off)
    } else {
      // Public storefront callers only ever see active/visible products
      whereClauses.push('(is_visible IS NULL OR is_visible = 1)');
    }

    if (search) {
      whereClauses.push('(name LIKE ? OR sku LIKE ? OR category_label LIKE ?)');
      const wild = `%${search}%`;
      params.push(wild, wild, wild);
    }

    if (category && category !== 'all') {
      whereClauses.push('(category_id = ? OR category_label LIKE ?)');
      params.push(category, `%${category}%`);
    }

    if (stock === 'instock' || stock === 'in_stock') {
      whereClauses.push('in_stock = 1');
    } else if (stock === 'outofstock' || stock === 'out_of_stock') {
      whereClauses.push('in_stock = 0');
    }

    const whereSql = whereClauses.join(' AND ');

    // Order clause
    let orderSql = 'created_at DESC';
    if (sortBy === 'price_asc') orderSql = 'price ASC';
    else if (sortBy === 'price_desc') orderSql = 'price DESC';
    else if (sortBy === 'name_asc') orderSql = 'name ASC';

    // Total count
    const [countResult] = await query<any[]>(
      `SELECT COUNT(*) as total FROM products WHERE ${whereSql};`,
      params
    );
    const total = countResult?.total || 0;

    // Fetch page products
    const products = await query<any[]>(
      `SELECT * FROM products WHERE ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?;`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error('Products API GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const id = data.id || `prod_${Date.now()}`;
    const name = data.name?.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    const slug = data.slug ? cleanSlug(data.slug) : cleanSlug(name) + '-' + id;
    const price = parseFloat(data.price) || 0.00;
    const regularPrice = data.regular_price ? parseFloat(data.regular_price) : null;
    const salePrice = data.sale_price ? parseFloat(data.sale_price) : null;
    const categoryId = data.category_id || 'carpets';
    const categoryLabel = data.category_label || 'Carpets & Broadloom';
    let unit = data.unit || 'sq. ft.';
    if (unit.toLowerCase().includes('yd')) {
      unit = 'sq. ft.';
    }
    const inStock = data.in_stock ? 1 : 0;
    const isFeatured = data.is_featured ? 1 : 0;
    const isVisible = data.is_visible !== undefined ? (data.is_visible ? 1 : 0) : 1;
    const image = data.image || '/images/slide01.jpg';
    const galleryImages = JSON.stringify(data.gallery_images || [image]);
    const colors = data.colors ? (typeof data.colors === 'string' ? data.colors : JSON.stringify(data.colors)) : null;
    const specs = data.specs ? (typeof data.specs === 'string' ? data.specs : JSON.stringify(data.specs)) : null;
    const features = data.features ? (typeof data.features === 'string' ? data.features : JSON.stringify(data.features)) : null;
    const description = data.description || '';
    const shortDescription = data.short_description || '';
    const badge = data.badge || null;
    const sku = data.sku || null;

    await query(`
      INSERT INTO products (
        id, wp_id, sku, name, slug, category_id, category_label,
        price, regular_price, sale_price, unit, rating, reviews_count,
        badge, in_stock, is_featured, is_visible, image, gallery_images, colors,
        description, short_description, specs, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      id, id, sku, name, slug, categoryId, categoryLabel,
      price, regularPrice, salePrice, unit, 5.0, 0,
      badge, inStock, isFeatured, isVisible, image, galleryImages, colors,
      description, shortDescription, specs, features
    ]);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      id,
    });
  } catch (err: any) {
    console.error('Products API POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
