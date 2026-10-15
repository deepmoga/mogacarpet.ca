'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/products';

export interface CartItem {
  id: string; // unique line item id: `${product.id}_${selectedColor || 'default'}`
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedImage?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number, selectedColor?: string, selectedImage?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  totalItems: number;
  subtotal: number;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  quoteModalOpen: boolean;
  setQuoteModalOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Initialize from localStorage if present
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('mogacarpet_cart');
      if (savedCart) setItems(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('mogacarpet_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // ignore
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('mogacarpet_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('mogacarpet_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const addToCart = (product: any, quantity = 1, selectedColor?: string, selectedImage?: string) => {
    const lineId = `${product.id}_${selectedColor || 'default'}`;
    const imgToUse = selectedImage || product.image;

    // ensure product price is a number
    const normalizedProduct: Product = {
      ...product,
      id: String(product.id),
      price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : product.price,
      image: imgToUse,
    };

    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === lineId);
      if (existingIdx > -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: lineId,
        product: normalizedProduct,
        quantity,
        selectedColor,
        selectedImage: imgToUse,
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId && item.product.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        (item.id === itemId || item.product.id === itemId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const toggleWishlist = (productId: string) => {
    const idStr = String(productId);
    setWishlist(prev =>
      prev.includes(idStr)
        ? prev.filter(id => id !== idStr)
        : [...prev, idStr]
    );
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        totalItems,
        subtotal,
        quickViewProduct,
        setQuickViewProduct,
        quoteModalOpen,
        setQuoteModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
