'use client';

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';

export default function HeroSlider() {
  const settings = useSettings();
  const bannerImage = settings.home_banner_image_url || '/images/slide01.jpg';
  const bannerLink = (settings.home_banner_link_url || '').trim();
  const bannerAlt = settings.home_banner_alt || settings.site_title || 'Moga Carpet & Flooring';

  const isExternal = bannerLink.startsWith('http://') || bannerLink.startsWith('https://');

  const bannerImageElement = (
    <div className="relative w-full overflow-hidden bg-stone-100 flex items-center justify-center">
      <img
        src={bannerImage}
        alt={bannerAlt}
        className="w-full h-auto max-h-[580px] lg:max-h-[700px] object-cover block transition-transform duration-500 ease-out group-hover:scale-[1.005]"
        loading="eager"
      />
    </div>
  );

  if (!bannerLink) {
    return (
      <section className="relative w-full bg-stone-100 border-b border-stone-200/60 shadow-sm">
        {bannerImageElement}
      </section>
    );
  }

  if (isExternal) {
    return (
      <section className="relative w-full bg-stone-100 border-b border-stone-200/60 shadow-sm">
        <a
          href={bannerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full group cursor-pointer"
          aria-label={bannerAlt}
        >
          {bannerImageElement}
        </a>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-stone-100 border-b border-stone-200/60 shadow-sm">
      <Link
        href={bannerLink}
        className="block w-full group cursor-pointer"
        aria-label={bannerAlt}
      >
        {bannerImageElement}
      </Link>
    </section>
  );
}
