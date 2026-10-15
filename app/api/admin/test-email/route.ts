import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';
import { getAllSettings } from '@/lib/settings';

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
    const body = await req.json().catch(() => ({}));
    const settings = await getAllSettings();
    const targetEmail = body.to || settings.admin_notification_email || settings.contact_email || 'info@mogacarpet.ca';

    const res = await sendEmail({
      to: targetEmail,
      subject: `[Test] Moga Carpet & Flooring Google SMTP Test (${new Date().toLocaleTimeString()})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #1212ff; border-radius: 12px;">
          <h2 style="color: #1212ff; margin-top: 0;">Google SMTP Verification Successful!</h2>
          <p style="color: #333; line-height: 1.6;">
            Your Google SMTP configuration at <strong>Moga Carpet & Flooring</strong> is working properly.
          </p>
          <ul style="color: #555; font-size: 13px;">
            <li>Host: <strong>${settings.smtp_host || 'smtp.gmail.com'}</strong></li>
            <li>Port: <strong>${settings.smtp_port || '587'}</strong></li>
            <li>User: <strong>${settings.smtp_user}</strong></li>
            <li>Sender Name: <strong>${settings.smtp_from_name}</strong></li>
          </ul>
          <p style="color: #888; font-size: 11px; margin-bottom: 0;">Sent automatically from Moga Carpet Admin Portal.</p>
        </div>
      `,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error || 'SMTP failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Test email successfully sent to ${targetEmail}!` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
