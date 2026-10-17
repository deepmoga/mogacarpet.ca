import { NextResponse } from 'next/server';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getAllSettings();

    // Strip internal/sensitive values, return clean public settings
    const publicSettings = {
      site_title: settings.site_title || 'Moga Carpet & Flooring',
      tagline: settings.tagline || 'Your one stop flooring shop',
      header_logo_url: settings.header_logo_url || settings.logo_url || '/images/cropped-web-logo-moga-carpet-flooring-5.png',
      footer_logo_url: settings.footer_logo_url || settings.header_logo_url || settings.logo_url || '/images/cropped-web-logo-moga-carpet-flooring-5.png',
      logo_url: settings.header_logo_url || settings.logo_url || '/images/cropped-web-logo-moga-carpet-flooring-5.png',
      favicon_url: settings.favicon_url || '/favicon.ico',
      contact_email: settings.contact_email || 'info@mogacarpet.ca',
      contact_phone: settings.contact_phone || '1-905-848-2222',
      contact_address: settings.contact_address || '1-8550 Torbram Road, Brampton, ON, Canada (Second Floor)',
      business_hours: settings.business_hours || 'Monday to Saturday 11:00 AM – 5:00 PM (Preferred By Appointment)',
      google_maps_url: settings.google_maps_url || 'https://maps.app.goo.gl/8pBrk8d4sy7C9vvG8',
      announcement_text: settings.announcement_text || 'Free Installation on Select Carpets & Vinyl Planks across the GTA!',
    };

    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
