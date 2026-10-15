import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload?.role === 'admin';
}

export async function POST(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename
    const origName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(origName) || '.jpg';
    const base = path.basename(origName, ext);
    const uniqueFilename = `${base}_${Date.now()}${ext}`;

    const publicDir = path.join(process.cwd(), 'public', 'images');
    const imagesDir = path.join(process.cwd(), 'images');

    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

    const publicPath = path.join(publicDir, uniqueFilename);
    const rootPath = path.join(imagesDir, uniqueFilename);

    fs.writeFileSync(publicPath, buffer);
    fs.writeFileSync(rootPath, buffer);

    const fileUrl = `/images/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
