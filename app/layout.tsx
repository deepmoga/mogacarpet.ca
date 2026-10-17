import type { Metadata } from 'next';
import './globals.css';
import { getAllSettings } from '@/lib/settings';
import { SettingsProvider } from '@/context/SettingsContext';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import QuoteModal from '@/components/QuoteModal';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings();
  const siteTitle = settings.site_title || 'Moga Carpet & Flooring | Your One Stop Flooring Shop | Brampton, ON';
  const tagline = settings.tagline || 'Premier Canadian destination for luxury carpets, handcrafted area rugs, commercial carpet tiles, and 100% waterproof luxury vinyl planks. Visit our Brampton showroom or book a free in-home estimate today.';
  const favicon = settings.favicon_url || '/favicon.ico';

  return {
    metadataBase: new URL('https://mogacarpet.ca'),
    title: siteTitle,
    description: tagline,
    keywords: 'carpet brampton, flooring shop ontario, joy carpets, area rugs canada, luxury vinyl planks, carpet tiles, underpad, solid hardwood brampton',
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: siteTitle,
      description: tagline,
      url: 'https://mogacarpet.ca',
      siteName: settings.site_title || 'Moga Carpet & Flooring',
      images: [
        {
          url: '/images/slide01.jpg',
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
      locale: 'en_CA',
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAllSettings();
  const publicSettings = {
    site_title: settings.site_title,
    tagline: settings.tagline,
    header_logo_url: settings.header_logo_url,
    footer_logo_url: settings.footer_logo_url,
    logo_url: settings.logo_url,
    favicon_url: settings.favicon_url,
    contact_email: settings.contact_email,
    contact_phone: settings.contact_phone,
    contact_address: settings.contact_address,
    business_hours: settings.business_hours,
    google_maps_url: settings.google_maps_url,
    announcement_text: settings.announcement_text || '',
  };
  const favicon = publicSettings.favicon_url || '/favicon.ico';

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={favicon} />
        <link rel="shortcut icon" href={favicon} />
        <link rel="apple-touch-icon" href={favicon} />
      </head>
      <body className="antialiased selection:bg-[#1212ff] selection:text-white">
        <SettingsProvider initialSettings={publicSettings}>
          <CartProvider>
            {children}
            <QuoteModal />
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
