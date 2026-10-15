'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, ArrowRight, PhoneCall } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Slide {
  id: number;
  image: string;
  badge: string;
  heading: string;
  subheading: string;
  accent: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: '/images/slide01.jpg',
    badge: 'GRAND FLOORING EVENT • SAVE UP TO 40%',
    heading: 'Transform Your Home With Canada’s Finest',
    subheading: 'Premium Broadloom Carpets, Handcrafted Area Rugs & Complete Free Installation Across the GTA.',
    accent: 'Luxury Carpets & Area Rugs',
    ctaText: 'Explore All Products',
    ctaLink: '/products',
    secondaryCtaText: 'Free In-Home Estimate',
  },
  {
    id: 2,
    image: '/images/slide02.jpg',
    badge: 'COMMERCIAL & RESIDENTIAL EXCELLENCE',
    heading: 'High-Performance Vinyl Planks & Carpet Tiles',
    subheading: '100% waterproof click SPC, acoustic tiles, and heavy-duty wear layers built for hotels, offices, and modern homes.',
    accent: '100% Waterproof SPC & LVT',
    ctaText: 'View Commercial Tiles',
    ctaLink: '/category/vinyl-flooring',
    secondaryCtaText: 'Download Price Catalog',
  },
  {
    id: 3,
    image: '/images/slide03.jpg',
    badge: 'TIMELESS LUXURY & TACTILE COMFORT',
    heading: 'Elegant Hardwood, Hand Scraped & Silk Weaves',
    subheading: 'Elevate every room with rich Canadian oak, designer runners, and ultra-dense memory foam acoustic underpad.',
    accent: 'Authentic Canadian Wood & Underpad',
    ctaText: 'Shop Best Sellers',
    ctaLink: '/products',
    secondaryCtaText: 'Visit Brampton Showroom',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setQuoteModalOpen } = useCart();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play interval (rotates slides every 5.5s)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchStartXRef.current - touchEndX;
      const deltaY = (touchStartYRef.current ?? 0) - touchEndY;

      // Only swipe if horizontal move is significant and greater than vertical scroll
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

    // Always ensure autoplay resumes on mobile after touch
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  // Safe hover handlers for desktop only
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

  return (
    <div 
      className="relative w-full h-[580px] sm:h-[640px] lg:h-[720px] overflow-hidden bg-[#0b1026] select-none"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Images & Overlays */}
      {SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.heading}
                fill
                priority={index === 0}
                className={`object-cover object-center transform transition-transform duration-7000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
              {/* Premium Gradient Overlay with deep navy tint */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b1026]/95 via-[#0b1026]/75 to-[#0b1026]/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1026]/95 via-transparent to-[#0b1026]/40" />
            </div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6">
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff0000]/20 border border-[#ff0000]/60 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-[#ff4d4d] animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                      {slide.badge}
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                    {slide.heading}{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#4d4dff] via-[#8585ff] to-[#ff4d4d] font-serif italic font-normal">
                      {slide.accent}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-stone-300 text-sm sm:text-lg max-w-xl font-light leading-relaxed">
                    {slide.subheading}
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Primary Button (Vibrant Brand Red) */}
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] shadow-lg shadow-red-500/25 transition-all duration-300 transform hover:-translate-y-0.5 group"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Secondary Button (Royal Brand Blue accent) */}
                    <button
                      onClick={() => setQuoteModalOpen(true)}
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-white border border-[#1212ff] bg-[#1212ff]/20 hover:bg-[#1212ff]/40 backdrop-blur-md transition-all duration-300 cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4 mr-2 text-[#4d4dff]" />
                      <span>{slide.secondaryCtaText}</span>
                    </button>
                  </div>

                  {/* Assurance tags */}
                  <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-stone-300">
                    <div className="flex items-center">
                      <ShieldCheck className="w-4 h-4 text-[#4d4dff] mr-1.5" />
                      <span>Direct Mill Warranties</span>
                    </div>
                    <span className="text-stone-600">•</span>
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                      <span>Professional Installation Available</span>
                    </div>
                    <span className="text-stone-600">•</span>
                    <div className="flex items-center">
                      <span>Brampton Showroom & GTA In-Home Consults</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#0b1026]/70 hover:bg-[#1212ff] text-white border border-stone-700/60 backdrop-blur-sm transition-all group cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#0b1026]/70 hover:bg-[#1212ff] text-white border border-stone-700/60 backdrop-blur-sm transition-all group cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Bottom Slider Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center space-x-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === currentSlide 
                ? 'w-10 h-2.5 bg-[#ff0000] shadow-md shadow-red-500/50' 
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
