'use client';

import React, { useState, useEffect } from 'react';
import ProductEditor from '@/components/admin/ProductEditor';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

interface EditProductClientProps {
  productId: string;
  initialProduct: any;
}

export default function EditProductClient({ productId, initialProduct }: EditProductClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1026] text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1212ff] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-400">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1026] p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">Admin Authentication Required</h2>
            <p className="text-xs text-stone-500 mt-1">
              Please log in to your Moga Carpet administrator account to access this product editor.
            </p>
          </div>
          <Link
            href="/mogacarpetaccess"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1212ff] hover:bg-[#0d0dcc] text-white text-xs font-bold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Admin Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProductEditor
      mode="edit"
      productId={productId}
      initialProduct={initialProduct}
    />
  );
}
