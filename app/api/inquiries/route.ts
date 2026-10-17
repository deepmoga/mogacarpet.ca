import { NextResponse } from 'next/server';
import { getInquiries, createInquiry } from '@/lib/inquiries';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { verifyRecaptcha } from '@/lib/recaptcha';

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

  try {
    const list = await getInquiries();
    return NextResponse.json({ success: true, inquiries: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify Google reCAPTCHA if configured & enabled
    const captchaResult = await verifyRecaptcha(body.captcha_token);
    if (!captchaResult.success) {
      return NextResponse.json(
        { success: false, error: captchaResult.error || 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    const {
      product_id,
      product_name,
      product_sku,
      product_price,
      product_image,
      variation_name,
      customer_name,
      customer_email,
      customer_phone,
      quantity_sqft,
      message,
    } = body;

    if (!customer_name?.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    if (!customer_email?.trim() || !customer_email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }
    if (!customer_phone?.trim()) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }
    if (!product_name?.trim()) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    const res = await createInquiry({
      product_id,
      product_name,
      product_sku,
      product_price,
      product_image,
      variation_name,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim(),
      customer_phone: customer_phone.trim(),
      quantity_sqft: quantity_sqft?.trim(),
      message: message?.trim(),
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error || 'Failed to submit inquiry' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      inquiry_number: res.inquiry_number,
      message: 'Thank you! Your product inquiry has been received. Our team will contact you shortly.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
