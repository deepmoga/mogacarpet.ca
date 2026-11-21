'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export interface BannerItem {
  id: number;
  title?: string;
  image_url: string;
  link_url?: string;
  alt_text?: string;
  display_order?: number;
  is_active?: number;
}

export default function HeroSlider({ initialBanners }: { initialBanners?: BannerItem[] }) {
  const settings = useSettings();
  const [banners, setBanners] = useState<BannerItem[]>(() => {
    if (initialBanners && initialBanners.length > 0) return initialBanners;
    return [
      {
        id: 1,
        title: 'Special Offers',
        image_url: settings.home_banner_image_url || '/images/slide01.jpg',
        link_url: settings.home_banner_link_url || '/shop',
        alt_text: settings.home_banner_alt || 'Moga Carpet & Flooring Special Offers',
      },
    ];
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch updated banners on mount or focus
  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const res = await fetch('/api/banners', { cache: 'no-store' });
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.banners) && data.banners.length > 0) {
          setBanners(data.banners);
        }
      } catch {
        // keep existing banners
      }
    }

    loadBanners();
    const handleFocus = () => loadBanners();
    window.addEventListener('focus', handleFocus);
    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const totalBanners = banners.length;

  const nextSlide = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const prevSlide = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  // Autoplay rotation every 5 seconds if multiple banners
  useEffect(() => {
    if (isPaused || totalBanners <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, totalBanners]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (totalBanners <= 1) return;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (totalBanners <= 1) return;
    if (touchStartXRef.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchStartXRef.current - touchEndX;
      const deltaY = (touchStartYRef.current ?? 0) - touchEndY;

      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      setIsPaused(true);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      setIsPaused(false);
    }
  };

  // Render single banner wrapper (handles click redirection if link exists)
  const renderBannerLink = (banner: BannerItem, isPriority: boolean) => {
    const bannerLink = (banner.link_url || '').trim();
    const bannerAlt = banner.alt_text || banner.title || settings.site_title || 'Moga Carpet & Flooring';
    const isExternal = bannerLink.startsWith('http://') || bannerLink.startsWith('https://');

    const imageElement = (
      <div className="relative w-full overflow-hidden bg-stone-100 flex items-center justify-center">
        <img
          src={banner.image_url}
          alt={bannerAlt}
          className="w-full h-auto max-h-[580px] lg:max-h-[700px] object-cover block transition-transform duration-500 ease-out group-hover:scale-[1.005]"
          loading={isPriority ? 'eager' : 'lazy'}
        />
      </div>
    );

    if (!bannerLink) {
      return (
        <div className="w-full">
          {imageElement}
        </div>
      );
    }

    if (isExternal) {
      return (
        <a
          href={bannerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full group cursor-pointer"
          aria-label={bannerAlt}
        >
          {imageElement}
        </a>
      );
    }

    return (
      <Link
        href={bannerLink}
        className="block w-full group cursor-pointer"
        aria-label={bannerAlt}
      >
        {imageElement}
      </Link>
    );
  };

  // Case 1: Single Banner
  if (totalBanners === 1) {
    return (
      <section className="relative w-full bg-stone-100 border-b border-stone-200/60 shadow-sm">
        {renderBannerLink(banners[0], true)}
      </section>
    );
  }

  // Case 2: Multiple Banners Slider
  return (
    <section
      className="relative w-full bg-stone-100 border-b border-stone-200/60 shadow-sm overflow-hidden select-none group/slider"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full">
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={banner.id || index}
              className={`transition-opacity duration-700 ease-in-out ${
                isActive ? 'relative z-10 opacity-100' : 'absolute inset-0 z-0 opacity-0 pointer-events-none'
              }`}
            >
              {renderBannerLink(banner, index === 0)}
            </div>
          );
        })}
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-[#1212ff] text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover/slider:opacity-100 cursor-pointer shadow-lg"
        aria-label="Previous Banner"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-[#1212ff] text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover/slider:opacity-100 cursor-pointer shadow-lg"
        aria-label="Next Banner"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === currentSlide
                ? 'w-8 h-2 bg-[#1212ff] shadow-md shadow-blue-500/50'
                : 'w-2 h-2 bg-white/70 hover:bg-white shadow-sm'
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
