'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import GoogleReCaptcha, { GoogleReCaptchaHandle } from '@/components/GoogleReCaptcha';
import { useSettings } from '@/context/SettingsContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit,
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  LogOut,
  X,
  AlertCircle,
  Eye,
  DollarSign,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Database,
  FolderTree,
  Folder,
  Tag,
  Filter,
  Mail,
  Send,
  Key,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  User,
  Ruler,
  Upload,
  Globe,
  Palette
} from 'lucide-react';
import { CATEGORIES, getFlattenedCategories } from '@/data/categories';

interface Product {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  category_id: string;
  category_label: string;
  price: number;
  regular_price: number | null;
  sale_price: number | null;
  unit: string;
  in_stock: number;
  is_featured: number;
  is_visible: number;
  image: string;
  description: string;
  short_description: string;
}

interface Quote {
  id: number;
  quote_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  city: string;
  category: string;
  approx_sqft: string | null;
  service_type: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Inquiry {
  id: number;
  inquiry_number: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  product_price?: number;
  product_image?: string;
  variation_name?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  quantity_sqft?: string;
  message?: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'Closed';
  created_at: string;
}

export default function AdminPage() {
  // Public Site Settings (for reCAPTCHA login check, branding, etc.)
  const publicSettings = useSettings();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginCaptchaToken, setLoginCaptchaToken] = useState<string | null>(null);
  const loginCaptchaRef = useRef<GoogleReCaptchaHandle>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'inquiries' | 'quotes' | 'categories' | 'settings'>('dashboard');

  // Products Data
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'off'>('all');
  const [productsLoading, setProductsLoading] = useState(false);

  // Inquiries Data
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<string>('all');
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // Quotes Data
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Categories Data & Hierarchy State
  const [categories, setCategories] = useState<any[]>([]);
  const [adminCatSearch, setAdminCatSearch] = useState('');
  const [adminCatFilterLevel, setAdminCatFilterLevel] = useState<'all' | '0' | '1' | '2'>('all');
  const [expandedAdminCats, setExpandedAdminCats] = useState<Record<string, boolean>>({
    'carpets': true,
    'area-rugs': true,
    'vinyl-flooring': true,
    'solid-hardwood': true,
    'stair-runner': true,
    'tiles': true,
    'countertop': true,
    'underpad': true
  });

  // Settings Data
  const [settings, setSettings] = useState<any>({
    site_title: 'Moga Carpet & Flooring',
    header_logo_url: '/images/moga-carpet-logo.png',
    footer_logo_url: '/images/moga-carpet-logo.png',
    favicon_url: '/images/favicon.png',
    contact_phone: '1-905-848-2222',
    contact_address: '1-8550 Torbram Road, Brampton, ON, Canada (Second Floor)',
    business_hours: 'Monday to Saturday 11:00 AM – 5:00 PM (Preferred By Appointment)',
    announcement_text: '',
    admin_username: 'admin',
    new_password: '',
    confirm_password: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_secure: 'tls',
    smtp_user: '',
    smtp_pass: '',
    smtp_from_email: 'info@mogacarpet.ca',
    smtp_from_name: 'Moga Carpet & Flooring',
    admin_notification_email: 'info@mogacarpet.ca',
    recaptcha_enabled: 'false',
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
  });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showRecaptchaSecret, setShowRecaptchaSecret] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [uploadingHeaderLogo, setUploadingHeaderLogo] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'header_logo_url' | 'footer_logo_url' | 'favicon_url',
    setLoading: (val: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSettings((prev: any) => ({ ...prev, [field]: data.url }));
      } else {
        alert(data.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading file.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Check auth status & URL tab
  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => setIsAuthenticated(false));

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab && ['dashboard', 'products', 'inquiries', 'quotes', 'categories', 'settings'].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '15',
        search: searchQuery,
        category: selectedCategory,
        stock: stockFilter,
        status: statusFilter,
        admin: 'true',
      });
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setTotalProducts(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, stockFilter, statusFilter]);

  // Fetch Inquiries
  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  // Fetch Secondary Data (Quotes, Categories, Settings)
  const fetchSecondaryData = useCallback(async () => {
    try {
      const [quotesRes, catsRes, settingsRes] = await Promise.all([
        fetch('/api/quotes'),
        fetch('/api/categories'),
        fetch('/api/admin/settings'),
      ]);
      const quotesData = await quotesRes.json();
      if (quotesData.success) setQuotes(quotesData.quotes || []);

      const catsData = await catsRes.json();
      if (catsData.success) setCategories(catsData.categories || []);

      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setSettings((prev: any) => ({ ...prev, ...settingsData.settings }));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchInquiries();
      fetchSecondaryData();
    }
  }, [isAuthenticated, fetchProducts, fetchInquiries, fetchSecondaryData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    if (publicSettings.recaptcha_enabled && publicSettings.recaptcha_site_key && !loginCaptchaToken) {
      setLoginError('Please complete the Google reCAPTCHA verification ("I am not a robot").');
      setLoginLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: loginUsername, 
          password: loginPassword,
          captcha_token: loginCaptchaToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Invalid credentials');
        loginCaptchaRef.current?.reset();
        setLoginCaptchaToken(null);
      }
    } catch {
      setLoginError('Failed to connect to server');
      loginCaptchaRef.current?.reset();
      setLoginCaptchaToken(null);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  // Toggle Stock Status
  const handleToggleStock = async (product: Product) => {
    const newStock = product.in_stock ? 0 : 1;
    await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ in_stock: newStock }),
    });
    fetchProducts();
  };

  // Toggle Visibility Status (Status: On / Off)
  const handleToggleVisibility = async (product: Product) => {
    const newVisibility = product.is_visible === 0 ? 1 : 0;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_visible: newVisibility } : p))
    );
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: newVisibility }),
      });
      fetchProducts();
    } catch (err) {
      console.error('Failed to toggle product status:', err);
      fetchProducts();
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (id: number, status: string) => {
    await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchInquiries();
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id: number, inquiryNumber: string) => {
    if (confirm(`Delete customer inquiry ${inquiryNumber}?`)) {
      await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      fetchInquiries();
    }
  };

  // Update Quote Status
  const handleUpdateQuoteStatus = async (id: number, status: string) => {
    await fetch('/api/quotes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchSecondaryData();
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (settings.new_password && settings.new_password.trim() !== '') {
      if (settings.new_password !== settings.confirm_password) {
        setPasswordError('New password and confirm password do not match.');
        return;
      }
      if (settings.new_password.length < 5) {
        setPasswordError('Password must be at least 5 characters long.');
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings((prev: any) => ({ ...prev, new_password: '', confirm_password: '' }));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 4000);
      } else {
        setPasswordError(data.error || 'Failed to save settings');
      }
    } catch {
      setPasswordError('Failed to connect to server');
    }
  };

  // Test Email
  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: settings.admin_notification_email || settings.contact_email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({ success: true, message: data.message });
      } else {
        setTestEmailResult({ success: false, message: data.error || 'SMTP Test failed. Please verify credentials.' });
      }
    } catch (err: any) {
      setTestEmailResult({ success: false, message: err.message || 'Network error occurred while testing SMTP.' });
    } finally {
      setTestEmailLoading(false);
    }
  };

  // Render Login if Not Authenticated (LIGHT THEME)
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#1212ff] mb-2 shadow-inner">
              <Database className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Moga Carpet Admin Portal</h2>
            <p className="text-xs text-stone-500">
              Sign in to manage catalog, customer inquiries, quotes & Google SMTP
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password (default: admin123)"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
              />
            </div>

            {publicSettings.recaptcha_enabled && publicSettings.recaptcha_site_key && (
              <div className="py-1">
                <GoogleReCaptcha
                  ref={loginCaptchaRef}
                  siteKey={publicSettings.recaptcha_site_key}
                  onChange={setLoginCaptchaToken}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] shadow-md hover:shadow-lg transition-all cursor-pointer font-sans"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs font-semibold text-[#1212ff] hover:underline transition-colors">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-[#1212ff]">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      !inquirySearch ||
      inq.customer_name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.customer_email?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.product_name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.inquiry_number?.toLowerCase().includes(inquirySearch.toLowerCase());
    const matchesStatus =
      inquiryFilterStatus === 'all' || inq.status === inquiryFilterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 flex flex-col font-sans">
      
      {/* ========================================================= */}
      {/* TOP HEADER (LIGHT THEME) */}
      {/* ========================================================= */}
      <header className="bg-white border-b border-stone-200 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-10 flex items-center">
            <img
              src={settings.header_logo_url || '/images/cropped-web-logo-moga-carpet-flooring-5.png'}
              alt="Moga Carpet Admin"
              className="h-9 w-auto object-contain object-left"
            />
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database: MySQL (`mogacarpet`)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#1212ff]" />
            <span>View Live Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-[#ff0000] hover:bg-[#ff0000] hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* ========================================================= */}
        {/* LEFT SIDEBAR (LIGHT THEME) */}
        {/* ========================================================= */}
        <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-4 space-y-1 shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'products', label: `Products (${totalProducts})`, icon: Package },
            { id: 'inquiries', label: `Product Inquiries (${inquiries.length})`, icon: MessageSquare, badge: inquiries.filter(i => i.status === 'New').length },
            { id: 'quotes', label: `Estimates & Leads (${quotes.length})`, icon: FileText },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'settings', label: 'Store & SMTP Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1212ff] text-white shadow-md'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    active ? 'bg-[#ff0000] text-white' : 'bg-[#ff0000] text-white'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="pt-6 border-t border-stone-100 mt-6 text-[11px] text-stone-500 px-3">
            <p className="font-bold text-stone-800">{settings.site_title || 'Moga Carpet & Flooring'}</p>
            <p>{settings.contact_address || '1-8550 Torbram Rd, Brampton'}</p>
            <p className="text-[#1212ff] font-bold mt-1">Light Professional Theme</p>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT CONTENT AREA (LIGHT THEME) */}
        {/* ========================================================= */}
        <main className="flex-1 p-6 lg:p-8 bg-stone-100 overflow-y-auto">
          
          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">Administrative Overview</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Connected to MySQL database <strong className="text-[#1212ff] font-mono">`mogacarpet`</strong>
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <span>Total Products</span>
                    <Package className="w-5 h-5 text-[#1212ff]" />
                  </div>
                  <div className="text-3xl font-black text-stone-900">{totalProducts}</div>
                  <span className="text-[11px] font-semibold text-emerald-600">All variations active</span>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <span>Product Inquiries</span>
                    <MessageSquare className="w-5 h-5 text-[#ff0000]" />
                  </div>
                  <div className="text-3xl font-black text-stone-900">{inquiries.length}</div>
                  <span className="text-[11px] font-bold text-[#ff0000]">
                    {inquiries.filter(i => i.status === 'New').length} New Unread
                  </span>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <span>Estimates / Leads</span>
                    <FileText className="w-5 h-5 text-[#1212ff]" />
                  </div>
                  <div className="text-3xl font-black text-stone-900">{quotes.length}</div>
                  <span className="text-[11px] text-stone-500">Free In-Home requests</span>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <span>Taxonomy Categories</span>
                    <Layers className="w-5 h-5 text-[#1212ff]" />
                  </div>
                  <div className="text-3xl font-black text-stone-900">{categories.length}</div>
                  <span className="text-[11px] text-stone-500">8 Departments • 3 Levels</span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Need to create or update a product?</h4>
                  <p className="text-xs text-stone-500">Add products with color variations, gallery images, and full WooCommerce specs.</p>
                </div>
                <Link
                  href="/mogacarpetaccess/products/new"
                  className="px-5 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </Link>
              </div>

              {/* Recent Inquiries Preview */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#ff0000]" />
                    <span>Recent Customer Inquiries</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className="text-xs font-bold text-[#1212ff] hover:underline"
                  >
                    View All Inquiries →
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <p className="text-xs text-stone-400 py-4 text-center">No inquiries received yet.</p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {inquiries.slice(0, 4).map((inq) => (
                      <div key={inq.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold text-stone-900">{inq.customer_name}</strong>
                            <span className="text-[10px] text-stone-400 font-mono">({inq.inquiry_number})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              inq.status === 'New' ? 'bg-red-50 text-[#ff0000]' : 'bg-blue-50 text-[#1212ff]'
                            }`}>
                              {inq.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 truncate mt-0.5">{inq.product_name}</p>
                        </div>
                        <div className="text-right text-xs">
                          <a href={`tel:${inq.customer_phone}`} className="font-semibold text-stone-800 hover:text-[#1212ff]">
                            {inq.customer_phone}
                          </a>
                          <span className="text-[10px] text-stone-400 block">{new Date(inq.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PRODUCTS CATALOG (LIGHT THEME) */}
          {/* ========================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">Products Management</h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Manage {totalProducts} items directly in the MySQL `mogacarpet` database
                  </p>
                </div>
                <Link
                  href="/mogacarpetaccess/products/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </Link>
              </div>

              {/* Filters Card */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Search */}
                  <div className="sm:col-span-4 relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search title, SKU, category..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-[#1212ff]"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="sm:col-span-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full py-2 px-3 text-xs rounded-xl bg-stone-50 border border-stone-300 text-stone-800 focus:outline-none focus:border-[#1212ff]"
                    >
                      <option value="all">All Categories ({totalProducts})</option>
                      {getFlattenedCategories().map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.level === 0 ? cat.name : cat.level === 1 ? `— ${cat.name}` : `—— ${cat.name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Filter */}
                  <div className="sm:col-span-2">
                    <select
                      value={stockFilter}
                      onChange={(e) => {
                        setStockFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full py-2 px-3 text-xs rounded-xl bg-stone-50 border border-stone-300 text-stone-800 focus:outline-none focus:border-[#1212ff]"
                    >
                      <option value="all">All Stock Status</option>
                      <option value="in_stock">In Stock Only</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>

                  {/* Status Filter (On / Off) */}
                  <div className="sm:col-span-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as any);
                        setCurrentPage(1);
                      }}
                      className="w-full py-2 px-3 text-xs rounded-xl bg-stone-50 border border-stone-300 text-stone-800 focus:outline-none focus:border-[#1212ff] font-medium"
                    >
                      <option value="all">All Status (On &amp; Off)</option>
                      <option value="active">Status: On (Visible)</option>
                      <option value="off">Status: Off (Hidden)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Table (Clean Light Theme) */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                {productsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-[#1212ff] animate-spin" />
                    <p className="text-xs font-bold text-stone-600">Loading products from MySQL...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-16 text-center text-stone-400 space-y-2">
                    <Package className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="text-sm">No products found matching your filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-700">
                      <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                        <tr>
                          <th className="py-3 px-4 w-14">Image</th>
                          <th className="py-3 px-4">Product Name & SKU</th>
                          <th className="py-3 px-4">Category Path</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4 text-center">Stock</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                                <Image
                                  src={prod.image || '/images/slide01.jpg'}
                                  alt={prod.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-bold text-stone-900 truncate">{prod.name}</div>
                              <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                                SKU: {prod.sku || 'N/A'} • ID: {prod.id}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-stone-600">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
                                {prod.category_label || prod.category_id}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-black text-stone-900">${Number(prod.price).toFixed(2)}</span>
                              <span className="text-[10px] text-stone-400 block">/ {prod.unit}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleToggleStock(prod)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  prod.in_stock
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-red-50 text-[#ff0000] border border-red-200 hover:bg-red-100'
                                }`}
                              >
                                {prod.in_stock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleToggleVisibility(prod)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-xs ${
                                  prod.is_visible !== 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-stone-100 text-stone-500 border border-stone-300 hover:bg-stone-200'
                                }`}
                                title={
                                  prod.is_visible !== 0
                                    ? 'Status is ON (Visible on front website). Click to turn OFF.'
                                    : 'Status is OFF (Hidden from front website). Click to turn ON.'
                                }
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    prod.is_visible !== 0 ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                                  }`}
                                />
                                <span>{prod.is_visible !== 0 ? 'On' : 'Off'}</span>
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/product/${prod.id}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#1212ff] hover:bg-blue-50 transition-colors"
                                  title="View on Storefront"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <Link
                                  href={`/mogacarpetaccess/products/${prod.id}`}
                                  className="p-1.5 rounded-lg text-stone-500 hover:text-[#1212ff] hover:bg-blue-50 transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#ff0000] hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                    <span>
                      Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalProducts} total)
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CUSTOMER PRODUCT INQUIRIES (NEW FEATURE) */}
          {/* ========================================================= */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-[#ff0000]" />
                    <span>Customer Product Inquiries</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1212ff] border border-blue-200 font-bold">
                      {inquiries.length} Total
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Submitted directly from single product pages or website contact forms. Sent via Google SMTP.
                  </p>
                </div>
                <button
                  onClick={fetchInquiries}
                  className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Inquiries</span>
                </button>
              </div>

              {/* Inquiries Filter Bar */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by customer, email, or product..."
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-[#1212ff]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto self-end">
                  <span className="text-xs text-stone-500 font-semibold">Status:</span>
                  <select
                    value={inquiryFilterStatus}
                    onChange={(e) => setInquiryFilterStatus(e.target.value)}
                    className="bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#1212ff]"
                  >
                    <option value="all">All Inquiries ({inquiries.length})</option>
                    <option value="New">New Only ({inquiries.filter(i => i.status === 'New').length})</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Inquiries Table */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                {inquiriesLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-[#1212ff] animate-spin" />
                    <p className="text-xs font-bold text-stone-600">Loading inquiries from database...</p>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="py-16 text-center text-stone-400 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="text-sm">No customer inquiries found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-700">
                      <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                        <tr>
                          <th className="py-3 px-4">Ref # & Date</th>
                          <th className="py-3 px-4">Customer Details</th>
                          <th className="py-3 px-4">Product / Requested Item</th>
                          <th className="py-3 px-4">Qty / Area</th>
                          <th className="py-3 px-4">Customer Message</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredInquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-[#1212ff] block">{inq.inquiry_number}</span>
                              <span className="text-[10px] text-stone-400">{new Date(inq.created_at).toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-stone-900">{inq.customer_name}</div>
                              <div className="text-[11px] text-stone-500">
                                <a href={`mailto:${inq.customer_email}`} className="text-[#1212ff] hover:underline">
                                  {inq.customer_email}
                                </a>
                              </div>
                              <div className="text-[11px] font-semibold text-stone-700">
                                <a href={`tel:${inq.customer_phone}`} className="hover:text-[#ff0000]">
                                  {inq.customer_phone}
                                </a>
                              </div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-bold text-stone-900 truncate">{inq.product_name}</div>
                              {inq.variation_name && (
                                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#1212ff] font-bold mt-0.5">
                                  Color: {inq.variation_name}
                                </span>
                              )}
                              {inq.product_sku && (
                                <span className="text-[10px] text-stone-400 block font-mono">SKU: {inq.product_sku}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-semibold text-stone-800">
                              {inq.quantity_sqft || '—'}
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                                {inq.message || 'No additional notes provided.'}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={inq.status}
                                onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                                  inq.status === 'New'
                                    ? 'bg-red-50 text-[#ff0000] border-red-200'
                                    : inq.status === 'Contacted'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : inq.status === 'Quoted'
                                    ? 'bg-blue-50 text-[#1212ff] border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Quoted">Quoted</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`mailto:${inq.customer_email}?subject=Re:%20Inquiry%20${inq.inquiry_number}%20-%20${encodeURIComponent(inq.product_name)}`}
                                  className="p-1.5 rounded-lg text-stone-500 hover:text-[#1212ff] hover:bg-blue-50 transition-colors"
                                  title="Reply via Email"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleDeleteInquiry(inq.id, inq.inquiry_number)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#ff0000] hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Inquiry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ESTIMATES & LEADS (QUOTES) */}
          {/* ========================================================= */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">Estimates & Lead Requests</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Requests submitted via the Instant Flooring Estimator and Free Measurement modals
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                {quotes.length === 0 ? (
                  <div className="py-16 text-center text-stone-400 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="text-sm">No estimates recorded in database yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-700">
                      <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                        <tr>
                          <th className="py-3 px-4">Quote #</th>
                          <th className="py-3 px-4">Customer Info</th>
                          <th className="py-3 px-4">Category & Sq Ft</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {quotes.map((q) => (
                          <tr key={q.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#1212ff]">{q.quote_number}</td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-stone-900">{q.customer_name}</div>
                              <div className="text-[11px] text-stone-500">
                                <a href={`tel:${q.customer_phone}`} className="hover:text-[#ff0000]">{q.customer_phone}</a>
                                {q.customer_email && <span> • {q.customer_email}</span>}
                              </div>
                              <div className="text-[10px] text-stone-400">{q.city || 'GTA'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-stone-800 capitalize">{q.category}</div>
                              <div className="text-[11px] text-stone-500">{q.approx_sqft || '—'} sq ft</div>
                            </td>
                            <td className="py-3 px-4 text-stone-600">{q.service_type || 'Supply & Install'}</td>
                            <td className="py-3 px-4">
                              <select
                                value={q.status}
                                onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                                className="bg-stone-50 border border-stone-300 rounded-lg text-[11px] font-bold px-2 py-1 text-stone-800 focus:outline-none"
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-[11px] text-stone-400">
                              {new Date(q.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CATEGORIES TREE (LIGHT THEME) */}
          {/* ========================================================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">Categories & Taxonomy Tree</h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Authentic 3-level WooCommerce taxonomy synced from your products export ({categories.length} total)
                  </p>
                </div>
              </div>

              {/* Hierarchy Filter Bar */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search categories & subcategories..."
                    value={adminCatSearch}
                    onChange={(e) => setAdminCatSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-[#1212ff]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
                  {(['all', '0', '1', '2'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAdminCatFilterLevel(lvl)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        adminCatFilterLevel === lvl
                          ? 'bg-[#1212ff] text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {lvl === 'all' ? 'All 3 Levels' : lvl === '0' ? 'Root (8 Depts)' : lvl === '1' ? 'Subcategories' : 'Sub-Subcategories'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hierarchy Tree */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
                {CATEGORIES.map((dept) => {
                  const isExpanded = expandedAdminCats[dept.id] ?? true;
                  return (
                    <div key={dept.id} className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
                      <div className="p-3.5 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setExpandedAdminCats(prev => ({ ...prev, [dept.id]: !prev[dept.id] }))}
                          className="flex items-center gap-2 font-black text-stone-900 text-xs sm:text-sm hover:text-[#1212ff] transition-colors"
                        >
                          <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                          <span>{dept.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1212ff]">
                            {dept.itemCount}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCategory(dept.id);
                            setActiveTab('products');
                          }}
                          className="text-xs font-bold text-[#ff0000] hover:underline"
                        >
                          Filter Products →
                        </button>
                      </div>

                      {isExpanded && dept.subcategories && (
                        <div className="p-4 space-y-3 bg-white divide-y divide-stone-100">
                          {dept.subcategories.map((sub) => {
                            const hasSubsubs = sub.subcategories && sub.subcategories.length > 0;
                            return (
                              <div key={sub.slug} className="pt-2 first:pt-0">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-stone-300">↳</span>
                                    <span className="font-bold text-stone-800">{sub.name}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSearchQuery(sub.name);
                                      setSelectedCategory(dept.id);
                                      setActiveTab('products');
                                    }}
                                    className="text-[11px] text-[#1212ff] hover:underline font-semibold"
                                  >
                                    View Products
                                  </button>
                                </div>

                                {hasSubsubs && (
                                  <div className="pl-6 pt-1.5 flex flex-wrap gap-1.5">
                                    {sub.subcategories!.map((subsub) => (
                                      <span
                                        key={subsub.slug}
                                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium border border-stone-200"
                                      >
                                        ↳ {subsub.name}
                                      </span>
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
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: STORE & GOOGLE SMTP SETTINGS (LIGHT THEME) */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">Store & SMTP Email Settings</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Configure store contact details and Google Gmail SMTP credentials for automated inquiry dispatch
                </p>
              </div>

              {settingsSaved && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Settings updated and saved to MySQL database successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* 1. WEBSITE BRANDING & LOGOS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900">Website Branding & Logo Settings</h3>
                        <p className="text-xs text-stone-500">Update header navigation logo, dark footer logo, and site browser favicon</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 text-[#1212ff] border border-blue-200 font-bold">
                      Dynamic Branding
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Header Logo */}
                    <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Header Navigation Logo</h4>
                          <p className="text-[11px] text-stone-500 mt-0.5">Used on desktop navbar & mobile menu</p>
                        </div>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingHeaderLogo ? 'Uploading...' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingHeaderLogo}
                            onChange={(e) => handleFileUpload(e, 'header_logo_url', setUploadingHeaderLogo)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Header Logo Preview Box */}
                      <div className="h-20 rounded-xl bg-white border border-stone-200 flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
                        {settings.header_logo_url ? (
                          <img
                            src={settings.header_logo_url}
                            alt="Header Logo Preview"
                            className="max-h-14 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-stone-400 font-medium">No logo configured</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Logo Image URL / Path
                        </label>
                        <input
                          type="text"
                          value={settings.header_logo_url || ''}
                          onChange={(e) => setSettings({ ...settings, header_logo_url: e.target.value })}
                          placeholder="/images/moga-carpet-logo.png or https://..."
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                        />
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          Recommended: Transparent PNG or SVG (~320×90px)
                        </span>
                      </div>
                    </div>

                    {/* Footer Logo */}
                    <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Footer Logo</h4>
                          <p className="text-[11px] text-stone-500 mt-0.5">Used on dark footer across all pages</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, footer_logo_url: settings.header_logo_url })}
                            className="text-[11px] font-bold text-[#1212ff] hover:underline px-2 py-1 cursor-pointer"
                            title="Copy header logo path"
                          >
                            Same as Header
                          </button>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingFooterLogo ? 'Uploading...' : 'Upload Logo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingFooterLogo}
                              onChange={(e) => handleFileUpload(e, 'footer_logo_url', setUploadingFooterLogo)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Footer Logo Preview Box (Dark background matching footer) */}
                      <div className="h-20 rounded-xl bg-[#0b1026] border border-stone-800 flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
                        {settings.footer_logo_url ? (
                          <img
                            src={settings.footer_logo_url}
                            alt="Footer Logo Preview"
                            className="max-h-14 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-stone-500 font-medium">No logo configured</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Logo Image URL / Path
                        </label>
                        <input
                          type="text"
                          value={settings.footer_logo_url || ''}
                          onChange={(e) => setSettings({ ...settings, footer_logo_url: e.target.value })}
                          placeholder="/images/moga-carpet-logo.png or https://..."
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                        />
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          Recommended: Light/White transparent PNG or SVG
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Site Favicon */}
                  <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Site Favicon & Browser Tab Icon</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">Displayed in web browser tabs, bookmarks, and mobile home screen icons</p>
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}</span>
                        <input
                          type="file"
                          accept=".ico,.png,.svg,.webp"
                          disabled={uploadingFavicon}
                          onChange={(e) => handleFileUpload(e, 'favicon_url', setUploadingFavicon)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Browser Tab Simulation Preview */}
                      <div className="bg-stone-200/60 p-3 rounded-xl border border-stone-300/80">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-2">Live Browser Tab Preview</span>
                        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-t-lg border-t border-l border-r border-stone-300 shadow-sm max-w-full">
                          {settings.favicon_url ? (
                            <img
                              src={settings.favicon_url}
                              alt="Favicon Preview"
                              className="w-4 h-4 object-contain rounded-sm shrink-0"
                            />
                          ) : (
                            <Globe className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-stone-800 truncate max-w-[220px]">
                            {settings.site_title || 'Moga Carpet & Flooring Brampton'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Favicon URL / Path
                        </label>
                        <input
                          type="text"
                          value={settings.favicon_url || ''}
                          onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                          placeholder="/images/favicon.png or /favicon.ico"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                        />
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          Accepts .ico, .png, .svg (Recommended: 32×32px or 64×64px)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. GOOGLE SMTP CONFIGURATION CARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1212ff] flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900">Google SMTP Mail Configuration</h3>
                        <p className="text-xs text-stone-500">Sends product inquiries and estimates directly to your inbox</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Nodemailer Ready
                    </span>
                  </div>

                  {testEmailResult && (
                    <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                      testEmailResult.success 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-red-50 text-[#ff0000] border border-red-200'
                    }`}>
                      {testEmailResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-[#ff0000]" />}
                      <span>{testEmailResult.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.smtp_host || 'smtp.gmail.com'}
                        onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        value={settings.smtp_port || '587'}
                        onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Google / Gmail User (Email)
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={settings.smtp_user || ''}
                        onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-stone-700">
                          Google App Password (16 characters)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="text-[11px] font-semibold text-[#1212ff] hover:underline"
                        >
                          {showSmtpPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showSmtpPass ? 'text' : 'password'}
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={settings.smtp_pass || ''}
                        onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Sender From Name
                      </label>
                      <input
                        type="text"
                        value={settings.smtp_from_name || 'Moga Carpet & Flooring'}
                        onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Admin Notification Email (Recipient)
                      </label>
                      <input
                        type="email"
                        placeholder="info@mogacarpet.ca"
                        value={settings.admin_notification_email || 'info@mogacarpet.ca'}
                        onChange={(e) => setSettings({ ...settings, admin_notification_email: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>
                  </div>

                  {/* Test Email Button */}
                  <div className="pt-2 flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <div>
                      <strong className="text-xs font-bold text-stone-900 block">Verify SMTP Settings</strong>
                      <span className="text-[11px] text-stone-500">Sends a live test notification to {settings.admin_notification_email || 'your email'}</span>
                    </div>
                    <button
                      type="button"
                      disabled={testEmailLoading || !settings.smtp_user}
                      onClick={handleTestEmail}
                      className="px-4 py-2 rounded-xl bg-[#1212ff] hover:bg-[#0a0ad8] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40 cursor-pointer"
                    >
                      {testEmailLoading ? 'Testing SMTP...' : 'Send Test Email'}
                    </button>
                  </div>
                </div>

                {/* 2. GENERAL STORE INFORMATION */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
                    General Store Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Website Title
                      </label>
                      <input
                        type="text"
                        value={settings.site_title || ''}
                        onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={settings.contact_phone || ''}
                        onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Showroom Address
                    </label>
                    <input
                      type="text"
                      value={settings.contact_address || ''}
                      onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Business Hours
                    </label>
                    <input
                      type="text"
                      value={settings.business_hours || ''}
                      onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Top Announcement Bar Text
                    </label>
                    <input
                      type="text"
                      value={settings.announcement_text || ''}
                      onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                    />
                  </div>
                </div>

                {/* 3. GOOGLE RECAPTCHA SECURITY SETTINGS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900">Google reCAPTCHA Security</h3>
                        <p className="text-xs text-stone-500">Protect login, quotes, contact forms & product inquiries against bots</p>
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.recaptcha_enabled === 'true' || settings.recaptcha_enabled === true}
                        onChange={(e) => setSettings({ ...settings, recaptcha_enabled: e.target.checked ? 'true' : 'false' })}
                        className="w-4 h-4 accent-[#1212ff] rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        {settings.recaptcha_enabled === 'true' || settings.recaptcha_enabled === true ? (
                          <span className="text-emerald-600">reCAPTCHA Enabled</span>
                        ) : (
                          <span className="text-stone-500">reCAPTCHA Disabled</span>
                        )}
                      </span>
                    </label>
                  </div>

                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs text-stone-600 space-y-1.5">
                    <div className="font-bold text-[#1212ff] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Google reCAPTCHA v2 ("I'm not a robot" Checkbox)</span>
                    </div>
                    <p className="leading-relaxed">
                      Register your site at <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-[#1212ff] font-bold underline">Google reCAPTCHA Admin Console</a>. Choose <strong>reCAPTCHA v2 &rarr; "I&apos;m not a robot" Checkbox</strong> and add your domains (<code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-[#1212ff]">mogacarpet.ca</code> and <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-[#1212ff]">localhost</code>).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Site Key (Public / Client-side)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={settings.recaptcha_site_key || ''}
                        onChange={(e) => setSettings({ ...settings, recaptcha_site_key: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                      <span className="text-[11px] text-stone-400 mt-1 block">
                        Visible to browser visitors to render the verification checkbox.
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-stone-700">
                          Secret Key (Private / Server-side)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowRecaptchaSecret(!showRecaptchaSecret)}
                          className="text-[11px] font-semibold text-[#1212ff] hover:underline cursor-pointer"
                        >
                          {showRecaptchaSecret ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showRecaptchaSecret ? 'text' : 'password'}
                        placeholder="e.g. 6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={settings.recaptcha_secret_key || ''}
                        onChange={(e) => setSettings({ ...settings, recaptcha_secret_key: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                      <span className="text-[11px] text-stone-400 mt-1 block">
                        Kept confidential on the server to verify submitted tokens with Google.
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-[11px] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      When enabled, the verification box automatically protects <strong>Admin Login</strong>, the <strong>Contact Us Form</strong>, and the <strong>Product Inquiry Modal</strong>.
                    </span>
                  </div>
                </div>

                {/* 4. ADMIN SECURITY & LOGIN CREDENTIALS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#ff0000] flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900">
                        Admin Security & Login Credentials
                      </h3>
                      <p className="text-xs text-stone-500">
                        Manage secret login credentials for the /mogacarpetaccess portal
                      </p>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[#ff0000] text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Admin Username
                      </label>
                      <input
                        type="text"
                        value={settings.admin_username || ''}
                        onChange={(e) => setSettings({ ...settings, admin_username: e.target.value })}
                        placeholder="admin"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                        required
                      />
                      <span className="text-[11px] text-stone-400 mt-1 block">Username to access /mogacarpetaccess</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-stone-700">
                          New Admin Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="text-[11px] font-semibold text-[#1212ff] hover:underline cursor-pointer"
                        >
                          {showNewPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={settings.new_password || ''}
                        onChange={(e) => setSettings({ ...settings, new_password: e.target.value })}
                        placeholder="Leave blank to keep existing password"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                      <span className="text-[11px] text-stone-400 mt-1 block">Only enter if you wish to change your password</span>
                    </div>
                  </div>

                  {settings.new_password && settings.new_password.trim() !== '' && (
                    <div className="max-w-md pt-1">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={settings.confirm_password || ''}
                        onChange={(e) => setSettings({ ...settings, confirm_password: e.target.value })}
                        placeholder="Re-type new password"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Save All Settings to Database
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
