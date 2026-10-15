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

export async function GET() {
  try {
    const categories = await query<any[]>(
      'SELECT * FROM categories ORDER BY level ASC, title ASC;'
    );
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
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
    const id = data.id || `cat_${Date.now()}`;
    const title = data.title?.trim();
    const slug = data.slug?.trim() || id;
    const parentId = data.parent_id || null;
    const level = data.level !== undefined ? parseInt(data.level, 10) : (parentId ? 1 : 0);
    const description = data.description || '';
    const itemCount = data.item_count || '0 Products';
    const image = data.image || '/images/slide01.jpg';
    const badge = data.badge || null;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    await query(`
      INSERT INTO categories (id, title, slug, parent_id, level, description, item_count, image, badge, is_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        slug = VALUES(slug),
        parent_id = VALUES(parent_id),
        level = VALUES(level),
        description = VALUES(description),
        item_count = VALUES(item_count),
        image = VALUES(image),
        badge = VALUES(badge);
    `, [id, title, slug, parentId, level, description, itemCount, image, badge]);

    return NextResponse.json({ success: true, message: 'Category saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    await query('DELETE FROM categories WHERE id = ? OR parent_id = ?;', [id, id]);

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
