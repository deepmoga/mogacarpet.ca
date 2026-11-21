import { NextResponse } from 'next/server';
import { getActiveBanners } from '@/lib/banners';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const banners = await getActiveBanners();
    return NextResponse.json({ success: true, banners });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
