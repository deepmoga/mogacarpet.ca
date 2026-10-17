'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Sparkles, 
  Calculator,
  ArrowRight,
  Store
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import { CATEGORIES, Category } from '@/data/categories';
import { searchCatalog } from '@/data/products';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, setIsCartOpen, wishlist, setQuoteModalOpen } = useCart();
  const settings = useSettings();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Products Mega Dropdown state (Desktop)
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownMouseEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setProductsDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setProductsDropdownOpen(false);
    }, 240);
  };

  // Mobile Accordion states
  const [mobileProductsOpen, setMobileProductsOpen] = useState(true);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProductsDropdownOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(e.target as Node)) {
        setProductsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchCatalog(searchQuery);

  const handleDesktopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileMenuOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Info Bar */}
      <div className="bg-[#0b1026] text-stone-300 text-xs py-2 px-4 border-b border-[#182046]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <span className="flex items-center text-stone-300">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#4d4dff]" />
              {settings.contact_address || '1-8550 Torbram Rd, Brampton ON'}
            </span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="hidden md:flex items-center text-stone-400">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#4d4dff]" />
              {settings.business_hours || 'Mon-Sat: 11AM - 5PM (By Appt)'}
            </span>
          </div>
          <div className="flex items-center space-x-5 text-stone-300">
            <a href={`tel:${(settings.contact_phone || '19058482222').replace(/[^0-9+]/g, '')}`} className="flex items-center hover:text-[#ff4d4d] transition-colors font-medium">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-[#ff0000]" />
              <span>Call / Text: {settings.contact_phone || '(905) 848-2222'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`transition-all duration-300 ${
        isScrolled 
          ? 'glass-nav shadow-lg border-b border-stone-200/80 py-3' 
          : 'bg-white border-b border-stone-200 py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0 group">
              <div className="relative h-12 w-48 sm:h-14 sm:w-56">
                <Image
                  src={settings.header_logo_url || settings.logo_url || '/images/cropped-web-logo-moga-carpet-flooring-5.png'}
                  alt={settings.site_title || "Moga Carpet & Flooring Brampton"}
                  fill
                  unoptimized
                  className="object-contain object-left group-hover:scale-102 transition-transform duration-300"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md relative" ref={searchRef}>
              <form onSubmit={handleDesktopSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search carpets, rugs, waterproof vinyl, hardwood..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-full pl-10 pr-12 py-2 focus:outline-none focus:border-[#1212ff] focus:ring-2 focus:ring-[#1212ff]/20 transition-all placeholder:text-stone-400"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold">Clear</button>
                )}
              </form>

              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50">
                  <div className="p-3 bg-stone-50 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider flex justify-between items-center">
                    <span>Matching Products ({searchResults.length})</span>
                    <span className="text-[10px] text-[#1212ff] font-bold">Click to view details</span>
                  </div>
                  <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                    {searchResults.map((prod) => (
                      <Link key={prod.id} href={`/product/${prod.id}`}
                        className="p-3 hover:bg-blue-50/70 flex items-center gap-3 cursor-pointer transition-colors"
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                          <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-stone-800 truncate">{prod.name}</h4>
                          <p className="text-[11px] text-stone-500">{prod.categoryName}</p>
                          <span className="text-xs font-bold text-[#1212ff]">${Number(prod.price).toFixed(2)} / {prod.unit}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center">
                    <Link href={`/shop?search=${encodeURIComponent(searchQuery)}`} onClick={() => setIsSearchOpen(false)} className="text-xs font-bold text-[#1212ff] hover:underline">
                      View All Search Results in Shop →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Free Estimate CTA Button (Brand Red) */}
              <button onClick={() => setQuoteModalOpen(true)} className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] shadow-md transition-all cursor-pointer">
                <Calculator className="w-3.5 h-3.5 mr-1.5" />
                <span>Get Free Estimate</span>
              </button>

              {/* Mobile Menu Button — sits above mobile drawer overlay (z-[60]) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden relative z-[60] p-2 rounded-lg text-stone-700 hover:bg-stone-100 cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-[#1212ff]" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center justify-between pt-3 mt-2 border-t border-stone-100 text-xs tracking-wide uppercase font-semibold text-stone-700">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link href="/" className={`px-3 py-1.5 rounded-md transition-colors ${pathname === '/' ? 'text-[#1212ff] font-bold bg-blue-50' : 'hover:text-[#1212ff] hover:bg-blue-50/50'}`}>
                Home
              </Link>

              {/* Products Mega Dropdown */}
              <div className="relative" ref={productsDropdownRef} onMouseEnter={handleDropdownMouseEnter} onMouseLeave={handleDropdownMouseLeave}>
                <Link
                  href="/products"
                  onClick={() => setProductsDropdownOpen(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer font-bold ${
                    productsDropdownOpen || pathname.startsWith('/product') || pathname.startsWith('/category') || pathname === '/shop' || pathname === '/products'
                      ? 'text-[#1212ff] bg-blue-50' : 'text-stone-800 hover:text-[#1212ff] hover:bg-blue-50/50'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-[#ff0000]" />
                  <span>Products</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${productsDropdownOpen ? 'rotate-180 text-[#1212ff]' : ''}`} />
                </Link>

                {productsDropdownOpen && (
                  <div
                    className="absolute top-full left-0 pt-2 z-50 before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 before:content-['']"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex w-[780px] lg:w-[860px] normal-case animate-fadeIn">
                      {/* Left: Categories */}
                      <div className="w-72 bg-stone-50/80 border-r border-stone-200/80 p-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">Categories</div>
                          {CATEGORIES.map((cat) => {
                            const isHovered = activeCategory.id === cat.id;
                            return (
                              <div key={cat.id} onMouseEnter={() => setActiveCategory(cat)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                  isHovered ? 'bg-white text-[#1212ff] font-bold shadow-sm border border-stone-200' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70 font-medium'
                                }`}
                              >
                                <Link href={`/category/${cat.id}`} className="flex-1 text-xs truncate" onClick={() => setProductsDropdownOpen(false)}>
                                  {cat.shortTitle || cat.name}
                                </Link>
                                <div className="flex items-center gap-1">
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isHovered ? 'bg-blue-50 text-[#1212ff]' : 'text-stone-400'}`}>{cat.itemCount}</span>
                                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isHovered ? 'text-[#1212ff] translate-x-0.5' : 'text-stone-400'}`} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="pt-3 mt-3 border-t border-stone-200">
                          <Link href="/shop" onClick={() => setProductsDropdownOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 text-[#1212ff] font-bold text-xs hover:bg-[#1212ff] hover:text-white transition-colors">
                            <span>Browse All 1,300+ Products</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Right: Subcategories */}
                      <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                        <div>
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
                            <div>
                              <Link href={`/category/${activeCategory.id}`} onClick={() => setProductsDropdownOpen(false)} className="text-sm font-bold text-stone-900 hover:text-[#1212ff] flex items-center gap-2">
                                <span>{activeCategory.name}</span>
                                {activeCategory.badge && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1212ff] text-white">{activeCategory.badge}</span>}
                              </Link>
                              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{activeCategory.description}</p>
                            </div>
                            <Link href={`/category/${activeCategory.id}`} onClick={() => setProductsDropdownOpen(false)} className="text-xs font-bold text-[#ff0000] hover:text-[#cc0000] flex items-center gap-1 whitespace-nowrap">
                              <span>View All</span><ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">Popular Subcategories &amp; Styles</div>
                          <div className="grid grid-cols-2 gap-2 text-xs max-h-96 overflow-y-auto pr-1">
                            {activeCategory.subcategories.map((sub) => {
                              const hasSubsubs = sub.subcategories && sub.subcategories.length > 0;
                              return (
                                <div key={sub.slug} className="p-2 rounded-xl bg-stone-50/60 border border-stone-100 hover:border-blue-200 transition-all space-y-1">
                                  <Link href={`/shop?category=${activeCategory.id}&search=${encodeURIComponent(sub.name)}`} onClick={() => setProductsDropdownOpen(false)} className="flex items-center justify-between font-bold text-stone-800 hover:text-[#1212ff] transition-colors">
                                    <span className="truncate">{sub.name}</span>
                                    <ArrowRight className="w-3 h-3 text-stone-300 hover:text-[#1212ff]" />
                                  </Link>
                                  {hasSubsubs && (
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {sub.subcategories!.map((subsub) => (
                                        <Link key={subsub.slug} href={`/shop?category=${activeCategory.id}&search=${encodeURIComponent(subsub.name)}`} onClick={() => setProductsDropdownOpen(false)} className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-blue-50 text-stone-600 hover:text-[#1212ff] border border-stone-200/80 transition-colors">
                                          ↳ {subsub.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs bg-stone-50 p-3 rounded-xl">
                          <span className="text-stone-600 font-medium">50,000 Sq Ft Warehouse in Brampton • Fast GTA Delivery</span>
                          <Link href={`/category/${activeCategory.id}`} onClick={() => setProductsDropdownOpen(false)} className="font-bold text-[#1212ff] hover:underline">
                            Explore {activeCategory.shortTitle || activeCategory.name} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/estimator" className={`px-3 py-1.5 rounded-md flex items-center transition-colors font-semibold ${pathname === '/estimator' ? 'text-[#1212ff] font-bold bg-blue-50' : 'text-stone-700 hover:text-[#1212ff] hover:bg-blue-50/50'}`}>
                <Calculator className="w-3.5 h-3.5 mr-1 text-[#ff0000]" />
                Flooring Estimator
              </Link>

              <Link href="/about" className={`px-3 py-1.5 rounded-md transition-colors font-semibold ${pathname === '/about' ? 'text-[#1212ff] font-bold bg-blue-50' : 'text-stone-700 hover:text-[#1212ff] hover:bg-blue-50/50'}`}>
                About Us
              </Link>

              <Link href="/contact" className={`px-3 py-1.5 rounded-md transition-colors font-semibold ${pathname === '/contact' ? 'text-[#1212ff] font-bold bg-blue-50' : 'text-stone-700 hover:text-[#1212ff] hover:bg-blue-50/50'}`}>
                Showroom &amp; Contact
              </Link>
            </div>

            <div className="hidden xl:flex items-center text-[11px] font-medium text-stone-500 normal-case">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping" />
              <span>Direct Mill Certified • Wholesale GTA Pricing</span>
            </div>
          </div>
        </div>
      </nav>

      {/* =====================================================================
          MOBILE DRAWER — Fixed overlay (z-50) so it is NEVER clipped by parent
          The hamburger button is z-[60] so it always appears on top of the overlay.
      ===================================================================== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
          {/* Dark backdrop — click to close */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Drawer panel — slides from top, scrollable */}
          <div className="absolute top-0 left-0 right-0 bg-white max-h-[90dvh] overflow-y-auto shadow-2xl">
            {/* Drawer top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-stone-100 shadow-sm">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="relative h-9 w-32">
                <Image
                  src={settings.header_logo_url || settings.logo_url || '/images/cropped-web-logo-moga-carpet-flooring-5.png'}
                  alt={settings.site_title || "Moga Carpet"}
                  fill
                  unoptimized
                  className="object-contain object-left"
                />
              </Link>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer" aria-label="Close menu">
                <X className="w-5 h-5 text-[#1212ff]" />
              </button>
            </div>

            <div className="px-4 pt-2 pb-8">
              {/* Mobile Search */}
              <form onSubmit={handleMobileSearchSubmit} className="relative my-3">
                <input
                  type="text"
                  placeholder="Search carpets, rugs, vinyl, hardwood..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-100 border border-stone-200 text-stone-800 text-sm rounded-xl pl-9 pr-14 py-2.5 focus:outline-none focus:border-[#1212ff]"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#1212ff] text-white text-xs font-bold">Search</button>
              </form>


              {/* Nav links */}
              <div className="space-y-1 text-sm font-medium text-stone-800">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-[#1212ff] font-bold bg-blue-50/70">Home</Link>

                {/* Products accordion */}
                <div className="border border-stone-200 rounded-xl overflow-hidden my-1">
                  <button type="button" onClick={() => setMobileProductsOpen(!mobileProductsOpen)} className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-50 font-bold text-stone-900 text-sm">
                    <span className="flex items-center gap-2"><Store className="w-4 h-4 text-[#ff0000]" /><span>Products Catalog</span></span>
                    <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${mobileProductsOpen ? 'rotate-180 text-[#1212ff]' : ''}`} />
                  </button>

                  {mobileProductsOpen && (
                    <div className="p-2 space-y-1 bg-white">
                      <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-[#ff0000] bg-red-50">
                        <span>Browse All Categories &amp; Products</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      {CATEGORIES.map((cat) => {
                        const isCatExpanded = mobileExpandedCat === cat.id;
                        return (
                          <div key={cat.id} className="border-b border-stone-100 last:border-0 py-1">
                            <button type="button" onClick={() => setMobileExpandedCat(isCatExpanded ? null : cat.id)} className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:text-[#1212ff]">
                              <span>{cat.shortTitle || cat.name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-stone-400 font-normal">{cat.itemCount}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCatExpanded ? 'rotate-180 text-[#1212ff]' : 'text-stone-400'}`} />
                              </div>
                            </button>
                            {isCatExpanded && (
                              <div className="pl-3 pr-2 py-2 space-y-1.5 bg-stone-50 rounded-lg text-xs">
                                <Link href={`/category/${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="block py-1 px-2 font-bold text-[#1212ff]">
                                  • View Entire {cat.shortTitle || cat.name} Catalog →
                                </Link>
                                {cat.subcategories.map((sub) => {
                                  const hasSubsubs = sub.subcategories && sub.subcategories.length > 0;
                                  return (
                                    <div key={sub.slug} className="space-y-0.5">
                                      <Link href={`/shop?category=${cat.id}&search=${encodeURIComponent(sub.name)}`} onClick={() => setMobileMenuOpen(false)} className="block py-1 px-2 text-stone-700 hover:text-[#1212ff] font-medium">
                                        • {sub.name}
                                      </Link>
                                      {hasSubsubs && (
                                        <div className="pl-4 space-y-0.5">
                                          {sub.subcategories!.map((subsub) => (
                                            <Link key={subsub.slug} href={`/shop?category=${cat.id}&search=${encodeURIComponent(subsub.name)}`} onClick={() => setMobileMenuOpen(false)} className="block py-0.5 px-2 text-[11px] text-stone-500 hover:text-[#1212ff]">
                                              ↳ {subsub.name}
                                            </Link>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Link href="/estimator" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-lg font-semibold ${pathname === '/estimator' ? 'text-[#1212ff] bg-blue-50' : 'hover:bg-stone-50 text-[#1212ff]'}`}>
                  Instant Flooring Estimator
                </Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-800">About Moga Carpet</Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-800">Showroom &amp; Contact</Link>
              </div>

              {/* CTA buttons */}
              <div className="mt-5 pt-4 border-t border-stone-200 space-y-2">
                <a href={`tel:${(settings.contact_phone || '19058482222').replace(/[^0-9+]/g, '')}`} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#ff0000] text-white font-bold text-sm">
                  <Phone className="w-4 h-4" /><span>Call Now: {settings.contact_phone || '(905) 848-2222'}</span>
                </a>
                <button type="button" onClick={() => { setMobileMenuOpen(false); setQuoteModalOpen(true); }} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#1212ff] text-[#1212ff] font-bold text-sm cursor-pointer">
                  <Calculator className="w-4 h-4" /><span>Get Free Measurement &amp; Estimate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
