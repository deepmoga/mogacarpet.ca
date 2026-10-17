import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { verifyToken, hashPassword } from '@/lib/auth';
import { getAllSettings, saveSettings } from '@/lib/settings';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload?.role === 'admin';
}

export async function GET() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAllSettings();
  // Don't leak raw password hash
  delete settings.admin_password;

  return NextResponse.json({ success: true, settings });
}

export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await req.json();

    // If admin username changed
    if (updates.admin_username && typeof updates.admin_username === 'string') {
      updates.admin_username = updates.admin_username.trim();
    }

    // If new password is provided, securely hash it
    if (updates.new_password && typeof updates.new_password === 'string' && updates.new_password.trim() !== '') {
      updates.admin_password = hashPassword(updates.new_password.trim());
      delete updates.new_password;
    } else {
      delete updates.new_password;
      delete updates.admin_password;
    }

    // Keep logo_url in sync with header_logo_url
    if (updates.header_logo_url) {
      updates.logo_url = updates.header_logo_url;
    }

    await saveSettings(updates);

    // Revalidate all pages layout cache
    try {
      revalidatePath('/', 'layout');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
