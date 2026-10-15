import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import QuoteModal from '@/components/QuoteModal';

export const metadata: Metadata = {
  metadataBase: new URL('https://mogacarpet.ca'),
  title: 'Moga Carpet & Flooring | Your One Stop Flooring Shop | Brampton, ON',
  description: 'Premier Canadian destination for luxury carpets, handcrafted area rugs, commercial carpet tiles, and 100% waterproof luxury vinyl planks. Visit our Brampton showroom or book a free in-home estimate today.',
  keywords: 'carpet brampton, flooring shop ontario, joy carpets, area rugs canada, luxury vinyl planks, carpet tiles, underpad, solid hardwood brampton',
  openGraph: {
    title: 'Moga Carpet & Flooring | Canada\'s Premier Flooring Store',
    description: 'Explore 500+ commercial and residential carpets, vinyl tiles, and designer rugs with factory direct mill pricing and certified installation.',
    url: 'https://mogacarpet.ca',
    siteName: 'Moga Carpet & Flooring',
    images: [
      {
        url: '/images/slide01.jpg',
        width: 1200,
        height: 630,
        alt: 'Moga Carpet & Flooring Showroom and Luxury Living',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#1212ff] selection:text-white">
        <CartProvider>
          {children}
          <QuoteModal />
        </CartProvider>
      </body>
    </html>
  );
}
