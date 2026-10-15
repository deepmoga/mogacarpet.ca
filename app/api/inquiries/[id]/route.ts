import { NextResponse } from 'next/server';
import { updateInquiryStatus, deleteInquiry } from '@/lib/inquiries';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload?.role === 'admin';
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await checkAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['New', 'Contacted', 'Quoted', 'Closed'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    await updateInquiryStatus(Number(id), status);
    return NextResponse.json({ success: true, message: 'Status updated' });
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
    await deleteInquiry(Number(id));
    return NextResponse.json({ success: true, message: 'Inquiry deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
