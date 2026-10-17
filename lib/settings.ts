import { query } from './db';

export interface SiteSettings {
  site_title: string;
  tagline: string;
  logo_url: string;
  header_logo_url: string;
  footer_logo_url: string;
  favicon_url: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  business_hours: string;
  google_maps_url: string;
  announcement_text: string;
  admin_username: string;
  admin_password?: string;
  smtp_host?: string;
  smtp_port?: string;
  smtp_secure?: string;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_from_email?: string;
  smtp_from_name?: string;
  admin_notification_email?: string;
  recaptcha_site_key?: string;
  recaptcha_secret_key?: string;
  recaptcha_enabled?: string;
  [key: string]: string | undefined;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_title: 'Moga Carpet & Flooring',
  tagline: 'Your one stop flooring shop',
  logo_url: '/images/cropped-web-logo-moga-carpet-flooring-5.png',
  header_logo_url: '/images/cropped-web-logo-moga-carpet-flooring-5.png',
  footer_logo_url: '/images/cropped-web-logo-moga-carpet-flooring-5.png',
  favicon_url: '/favicon.ico',
  contact_email: 'info@mogacarpet.ca',
  contact_phone: '1-905-848-2222',
  contact_address: '1-8550 Torbram Road, Brampton, ON, Canada (Second Floor)',
  business_hours: 'Monday to Saturday 11:00 AM – 5:00 PM (Preferred By Appointment)',
  google_maps_url: 'https://maps.app.goo.gl/8pBrk8d4sy7C9vvG8',
  announcement_text: '',
  admin_username: 'admin',
  admin_password: 'admin123',
  smtp_host: 'smtp.gmail.com',
  smtp_port: '587',
  smtp_secure: 'tls',
  smtp_user: '',
  smtp_pass: '',
  smtp_from_email: 'info@mogacarpet.ca',
  smtp_from_name: 'Moga Carpet & Flooring',
  admin_notification_email: 'info@mogacarpet.ca',
  recaptcha_site_key: '',
  recaptcha_secret_key: '',
  recaptcha_enabled: 'false',
};

export async function ensureSettingsTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(191) PRIMARY KEY,
        value_text LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    console.warn('Could not verify/create settings table:', err);
  }
}

export async function getAllSettings(): Promise<SiteSettings> {
  try {
    await ensureSettingsTable();
    const rows = await query<{ key_name: string; value_text: string }[]>(
      'SELECT key_name, value_text FROM settings;'
    );
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key_name] = r.value_text ?? '';
    }
    const merged = { ...DEFAULT_SETTINGS, ...map };
    // Synchronize header & footer logos with logo_url fallback
    if (!merged.header_logo_url && merged.logo_url) {
      merged.header_logo_url = merged.logo_url;
    }
    if (!merged.footer_logo_url) {
      merged.footer_logo_url = merged.header_logo_url || merged.logo_url;
    }
    if (!merged.logo_url) {
      merged.logo_url = merged.header_logo_url || DEFAULT_SETTINGS.logo_url;
    }
    if (!merged.favicon_url) {
      merged.favicon_url = DEFAULT_SETTINGS.favicon_url;
    }
    return merged;
  } catch (err) {
    console.warn('Failed to read settings from DB, returning defaults:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(updates: Partial<SiteSettings>): Promise<void> {
  await ensureSettingsTable();
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    await query(
      `INSERT INTO settings (key_name, value_text)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE value_text = VALUES(value_text);`,
      [key, String(value)]
    );
  }
}
