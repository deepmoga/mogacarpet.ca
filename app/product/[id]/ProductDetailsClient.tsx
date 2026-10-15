'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Heart, 
  Check, 
  Calculator, 
  PhoneCall, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ZoomIn,
  X,
  Send
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductInquiryModal from '@/components/ProductInquiryModal';

interface ColorVariant {
  name: string;
  color_code?: string;
  image?: string;
}

interface ProductDetailsClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    category_id: string;
    category_label: string;
    price: number;
    regular_price: number | null;
    sale_price: number | null;
    unit: string;
    rating: number;
    reviews_count: number;
    badge: string | null;
    in_stock: number;
    image: string;
    gallery_images: string[];
    colors: ColorVariant[];
    description: string;
    short_description: string;
    specs: any;
    features: string[];
  };
  relatedProducts: any[];
}

export function cleanAndFormatDescription(raw: string): { label?: string; value: string }[] {
  if (!raw) return [];
  let text = String(raw);

  // Unescape literal \r, \n, \t
  text = text.replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\\t/g, ' ');

  // Remove WordPress shortcodes (e.g. [contact-form]...[/contact-form], [gallery], etc.)
  text = text.replace(/\[contact-form[\s\S]*?\[\/contact-form\]/gi, '');
  text = text.replace(/\[\/?(contact-form|contact-field|gallery|caption|embed|video|audio)[^\]]*\]/gi, '');
  text = text.replace(/\[[a-zA-Z0-9_-]+(\s+[^\]]*)?\]/g, '');

  // Remove accordion triggers and headers from old WP themes
  text = text.replace(/<span[^>]*class=["'][^"']*trigger[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '');
  text = text.replace(/<span[^>]*class=["'][^"']*line trigger title[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '');

  // Convert block tags to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/?(p|div|tr|li|h[1-6])[^>]*>/gi, '\n');

  // Strip remaining HTML tags (ensuring mathematical <8 or >0.5 are preserved)
  text = text.replace(/<\/?([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*>/gi, '');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"')
             .replace(/&#8217;/g, "'")
             .replace(/&#8220;/g, '"')
             .replace(/&#8221;/g, '"')
             .replace(/&#8243;/g, '"')
             .replace(/&nbsp;/g, ' ')
             .replace(/&bull;/g, '•');

  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const formatted: { label?: string; value: string }[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const cur = rawLines[i];
    const next = rawLines[i + 1];

    if (cur.endsWith(':') && next && !next.includes(':') && next.length < 120) {
      const label = cur.slice(0, -1).trim();
      formatted.push({ label, value: next });
      i++;
      continue;
    }

    const colonIdx = cur.indexOf(':');
    if (colonIdx > 0 && colonIdx < 32 && !cur.startsWith('http')) {
      const label = cur.substring(0, colonIdx).trim();
      const val = cur.substring(colonIdx + 1).trim();
      formatted.push({ label, value: val });
    } else {
      formatted.push({ value: cur });
    }
  }

  return formatted;
}

export default function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const { addToCart, wishlist, toggleWishlist, setQuoteModalOpen } = useCart();
  
  // Real Color & Image state
  // Only true if product has actual distinct color variations (more than 1 unique color name)
  const hasColors = Array.isArray(product.colors) && 
    product.colors.length > 1 && 
    new Set(product.colors.map(c => c?.name?.trim().toLowerCase()).filter(Boolean)).size > 1;
  
  const [selectedColor, setSelectedColor] = useState<string>(
    hasColors ? product.colors![0].name : ''
  );
  const [activeImage, setActiveImage] = useState<string>(
    (hasColors && product.colors[0]?.image) ? product.colors[0].image! : (product.image || '/images/slide01.jpg')
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  const isWishlisted = wishlist.includes(String(product.id));

  // Handler for color selection
  const handleSelectColor = (color: ColorVariant) => {
    setSelectedColor(color.name);
    if (color.image) {
      setActiveImage(color.image);
    }
  };

  // Handler for add to cart
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor || undefined, activeImage);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const discountPercent = product.regular_price && product.regular_price > product.price
    ? Math.round((1 - product.price / product.regular_price) * 100)
    : 0;

  // Compile list of distinct gallery photos
  const allImages = Array.from(new Set([
    product.image,
    ...(product.gallery_images || []),
    ...(hasColors ? product.colors.map(c => c.image).filter(Boolean) as string[] : [])
  ])).filter(Boolean);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs Bar */}
      <div className="bg-stone-50 border-b border-stone-200 py-3 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#1212ff] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/shop" className="hover:text-[#1212ff] transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href={`/category/${product.category_id}`} className="hover:text-[#1212ff] font-medium text-stone-700 capitalize transition-colors">
            {product.category_label || product.category_id.replace(/-/g, ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* LEFT: GALLERY & IMAGES (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Featured Image Container with Zoom */}
            <div className="relative h-[380px] sm:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-md group">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover object-center transition-transform duration-500 group-hover:scale-102 cursor-pointer"
                onClick={() => setIsZoomOpen(true)}
              />

              {/* Zoom In Button (like WordPress old website) */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md backdrop-blur-md z-10 transition-transform active:scale-90"
                title="Zoom in on photo"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-stone-700" />
              </button>

              {/* Badges on Main Image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1212ff] text-white shadow-md">
                    {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ff0000] text-white shadow-md">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Preview Strip (Like WordPress Old Website) */}
            {allImages.length > 1 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {allImages.map((img, idx) => {
                    const isSelected = activeImage === img;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                          isSelected
                            ? 'border-[#1212ff] shadow-md scale-102 ring-2 ring-[#1212ff]/20'
                            : 'border-stone-200 hover:border-stone-400 opacity-75 hover:opacity-100'
                        }`}
                        title={`View photo ${idx + 1}`}
                      >
                        <Image src={img} alt={`${product.name} photo ${idx + 1}`} fill className="object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: PRODUCT INFO & ORDER ACTIONS (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">

              {/* Title & SKU */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {product.name}
                </h1>
                {product.sku && (
                  <p className="text-xs text-stone-400 mt-1 font-mono">
                    SKU: <strong className="text-stone-600">{product.sku}</strong>
                  </p>
                )}
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-stone-900">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.regular_price && product.regular_price > product.price && (
                  <span className="text-lg text-stone-400 line-through">
                    ${Number(product.regular_price).toFixed(2)}
                  </span>
                )}
                <span className="text-xs font-semibold text-stone-500 uppercase">
                  per {product.unit}
                </span>
              </div>

              {/* COLOR SELECTOR (ONLY SHOWN IF PRODUCT ACTUALLY HAS COLOR VARIATIONS) */}
              {hasColors && (
                <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1212ff]" />
                      <span>Color Options:</span>
                    </label>
                    <span className="text-xs font-extrabold text-[#1212ff]">
                      {selectedColor}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {product.colors.map((color, idx) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectColor(color)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white border-[#1212ff] text-[#1212ff] shadow-md ring-2 ring-[#1212ff]/20'
                              : 'bg-white/80 border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-white'
                          }`}
                        >
                          {/* Color Dot Swatch */}
                          <span
                            className="w-4 h-4 rounded-full border border-stone-300 shadow-inner flex-shrink-0"
                            style={{ backgroundColor: color.color_code || '#1212ff' }}
                          />
                          <span>{color.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#1212ff]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Short Description (Excerpt) */}
              {product.short_description && (
                <div className="text-stone-600 text-xs sm:text-sm leading-relaxed space-y-1">
                  {cleanAndFormatDescription(product.short_description).map((item, idx) => (
                    <p key={idx}>
                      {item.label ? (
                        <>
                          <strong className="text-stone-800 font-semibold">{item.label}: </strong>
                          <span>{item.value}</span>
                        </>
                      ) : (
                        item.value
                      )}
                    </p>
                  ))}
                </div>
              )}

              {/* Inquire & Quote CTA */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  
                  {/* Quantity Controller */}
                  <div className="flex items-center border border-stone-300 rounded-2xl bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-xl font-bold transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-black text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-xl font-bold transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Inquire / Request Quote Button */}
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#ff0000] hover:bg-[#cc0000] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>Inquire Now / Get Quote</span>
                  </button>
                </div>

                {/* Free Measurement & Sample CTA */}
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(true)}
                  className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#1212ff] bg-blue-50/60 hover:bg-[#1212ff] text-[#1212ff] hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 group"
                >
                  <Calculator className="w-4 h-4 text-[#ff0000] group-hover:text-white transition-colors" />
                  <span>Request Free In-Home Measurement & Color Samples</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Categories Link (Exactly like WordPress Screenshot) */}
              <div className="pt-4 border-t border-stone-200 text-xs text-stone-500">
                <span className="font-semibold text-stone-700">Categories: </span>
                <Link
                  href={`/category/${product.category_id}`}
                  className="text-[#1212ff] hover:underline font-semibold"
                >
                  {product.category_label || product.category_id}
                </Link>
              </div>

              {/* Direct Call / Contact Bar */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-[11px] text-stone-400 block font-medium">Brampton Showroom Specialist</span>
                  <strong className="text-xs text-white">Need a custom roll cut or contractor quote?</strong>
                </div>
                <a
                  href="tel:19058482222"
                  className="px-4 py-2 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>(905) 848-2222</span>
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* ONLY THE AUTHENTIC DATABASE DESCRIPTION (CLEAN, NO TAGS, NO SYNTHETIC TABS) */}
        {product.description && (
          <div className="mt-14 pt-8 border-t border-stone-200">
            <h3 className="text-base font-extrabold text-stone-900 mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#1212ff] rounded-full inline-block" />
              <span>Description</span>
            </h3>
            
            <div className="max-w-4xl bg-stone-50/70 border border-stone-200/80 rounded-2xl p-6 sm:p-7 space-y-3 text-sm">
              {cleanAndFormatDescription(product.description).map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item.label ? (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-1 border-b border-stone-100 last:border-0">
                      <span className="font-bold text-stone-900 sm:w-44 flex-shrink-0 text-xs sm:text-sm tracking-wide">
                        {item.label}:
                      </span>
                      <span className="text-stone-700 font-medium">
                        {item.value}
                      </span>
                    </div>
                  ) : (
                    <p className="text-stone-700 font-normal">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RELATED PRODUCTS */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-[#1212ff] uppercase tracking-wider block mb-1">
                  More in {product.category_label || product.category_id}
                </span>
                <h3 className="text-2xl font-extrabold text-stone-900">
                  Related Products
                </h3>
              </div>
              <Link
                href={`/category/${product.category_id}`}
                className="text-xs font-bold text-[#1212ff] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="relative h-56 w-full bg-stone-100 overflow-hidden">
                    <Image
                      src={rel.image || '/images/slide01.jpg'}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-106 transition-transform duration-500"
                    />
                    {rel.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1212ff] text-white shadow-sm">
                        {rel.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#1212ff] uppercase tracking-wide">
                        {rel.category_label || rel.category_id}
                      </span>
                      <h4 className="font-bold text-xs text-stone-900 group-hover:text-[#1212ff] transition-colors line-clamp-2">
                        {rel.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-stone-900">${Number(rel.price).toFixed(2)}</span>
                        <span className="text-[10px] text-stone-400 block">per {rel.unit}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#ff0000] group-hover:translate-x-1 transition-transform flex items-center">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FULLSCREEN LIGHTBOX ZOOM MODAL */}
      {isZoomOpen && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-colors z-10"
            aria-label="Close zoomed photo"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full h-[80vh]">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* DIRECT PRODUCT INQUIRY POPUP MODAL */}
      <ProductInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        product={{
          id: String(product.id),
          name: product.name,
          sku: product.sku,
          price: product.price,
          unit: product.unit,
          image: activeImage || product.image,
        }}
        selectedColor={selectedColor}
        initialQuantity={quantity}
      />

    </div>
  );
}
