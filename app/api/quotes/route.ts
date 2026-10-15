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
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quotes = await query<any[]>('SELECT * FROM quotes ORDER BY created_at DESC;');
    return NextResponse.json({ success: true, quotes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const customerName = data.name || data.customer_name;
    const customerPhone = data.phone || data.customer_phone;

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    const quoteNumber = `EST-${Date.now().toString().slice(-6)}`;
    const customerEmail = data.email || data.customer_email || null;
    const city = data.city || 'Brampton';
    const category = data.category || 'Carpets & Underpad';
    const approxSqft = data.sqft || data.approx_sqft || null;
    const serviceType = data.service_type || data.serviceType || 'Free In-Home Measurement';
    const estimatedTotal = data.estimated_total ? parseFloat(data.estimated_total) : null;
    const notes = data.message || data.notes || '';

    await query(`
      INSERT INTO quotes (
        quote_number, customer_name, customer_phone, customer_email,
        city, category, approx_sqft, service_type, estimated_total, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New');
    `, [
      quoteNumber, customerName, customerPhone, customerEmail,
      city, category, approxSqft, serviceType, estimatedTotal, notes
    ]);

    return NextResponse.json({
      success: true,
      message: 'Estimate request submitted successfully',
      quoteNumber,
    });
  } catch (err: any) {
    console.error('Quote submission error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
    }

    await query('UPDATE quotes SET status = ? WHERE id = ?;', [status, id]);
    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
