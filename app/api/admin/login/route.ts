import { NextResponse } from 'next/server';
import { getAllSettings } from '@/lib/settings';
import { verifyPassword, generateToken } from '@/lib/auth';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(req: Request) {
  try {
    const { username, password, captcha_token } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify Google reCAPTCHA if configured & enabled
    const captchaResult = await verifyRecaptcha(captcha_token);
    if (!captchaResult.success) {
      return NextResponse.json(
        { success: false, error: captchaResult.error || 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    const settings = await getAllSettings();
    const validUsername = settings.admin_username || 'admin';
    const validPassword = settings.admin_password || 'admin123';

    if (username !== validUsername || !verifyPassword(password, validPassword)) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = generateToken({ role: 'admin', username: validUsername });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: { username: validUsername },
    });

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Admin login error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
