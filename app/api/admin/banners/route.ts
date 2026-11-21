import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { verifyToken } from '@/lib/auth';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '@/lib/banners';

export const dynamic = 'force-dynamic';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload?.role === 'admin';
}

// GET all banners (including inactive)
export async function GET() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const banners = await getAllBanners();
    return NextResponse.json({ success: true, banners });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST create a new banner
export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.image_url || typeof body.image_url !== 'string') {
      return NextResponse.json({ success: false, error: 'Banner image URL is required.' }, { status: 400 });
    }

    const id = await createBanner({
      title: body.title?.trim() || '',
      image_url: body.image_url.trim(),
      link_url: body.link_url?.trim() || '',
      alt_text: body.alt_text?.trim() || body.title?.trim() || 'Moga Carpet & Flooring Banner',
      display_order: Number(body.display_order) || 0,
      is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
    });

    try {
      revalidatePath('/', 'layout');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT update an existing banner
export async function PUT(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!id) {
      return NextResponse.json({ success: false, error: 'Valid Banner ID is required.' }, { status: 400 });
    }

    await updateBanner(id, {
      title: body.title !== undefined ? String(body.title).trim() : undefined,
      image_url: body.image_url !== undefined ? String(body.image_url).trim() : undefined,
      link_url: body.link_url !== undefined ? String(body.link_url).trim() : undefined,
      alt_text: body.alt_text !== undefined ? String(body.alt_text).trim() : undefined,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
      is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : undefined,
    });

    try {
      revalidatePath('/', 'layout');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE a banner
export async function DELETE(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = Number(searchParams.get('id'));

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = Number(body.id);
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Valid Banner ID is required.' }, { status: 400 });
    }

    await deleteBanner(id);

    try {
      revalidatePath('/', 'layout');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
