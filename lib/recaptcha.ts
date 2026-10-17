import { getAllSettings } from './settings';

/**
 * Verifies a Google reCAPTCHA response token against Google's siteverify API.
 * If reCAPTCHA is disabled in settings or the secret key is empty, it returns success: true.
 */
export async function verifyRecaptcha(token?: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const isEnabled = settings.recaptcha_enabled === 'true' || settings.recaptcha_enabled === '1';
    const secretKey = settings.recaptcha_secret_key?.trim();

    // If reCAPTCHA is not enabled or secret key is empty, allow submission gracefully
    if (!isEnabled || !secretKey) {
      return { success: true };
    }

    if (!token || typeof token !== 'string' || !token.trim()) {
      return {
        success: false,
        error: 'Please complete the Google reCAPTCHA verification ("I am not a robot").',
      };
    }

    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token.trim());

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      console.warn('Google reCAPTCHA error codes:', data['error-codes'] || data);
      return {
        success: false,
        error: 'Google reCAPTCHA verification failed. Please verify that you are not a robot.',
      };
    }
  } catch (err: any) {
    console.error('Error communicating with Google reCAPTCHA API:', err);
    return {
      success: false,
      error: 'Unable to connect to Google reCAPTCHA verification service.',
    };
  }
}
