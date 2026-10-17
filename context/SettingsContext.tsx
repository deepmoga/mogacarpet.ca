'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface PublicSettings {
  site_title: string;
  tagline: string;
  header_logo_url: string;
  footer_logo_url: string;
  logo_url: string;
  favicon_url: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  business_hours: string;
  google_maps_url: string;
  announcement_text: string;
}

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  site_title: 'Moga Carpet & Flooring',
  tagline: 'Your one stop flooring shop',
  header_logo_url: '/images/cropped-web-logo-moga-carpet-flooring-5.png',
  footer_logo_url: '/images/cropped-web-logo-moga-carpet-flooring-5.png',
  logo_url: '/images/cropped-web-logo-moga-carpet-flooring-5.png',
  favicon_url: '/favicon.ico',
  contact_email: 'info@mogacarpet.ca',
  contact_phone: '1-905-848-2222',
  contact_address: '1-8550 Torbram Road, Brampton, ON, Canada (Second Floor)',
  business_hours: 'Monday to Saturday 11:00 AM – 5:00 PM (Preferred By Appointment)',
  google_maps_url: 'https://maps.app.goo.gl/8pBrk8d4sy7C9vvG8',
  announcement_text: '',
};

interface SettingsContextType {
  settings: PublicSettings;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_PUBLIC_SETTINGS,
  refreshSettings: async () => {},
});

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<PublicSettings>;
}) {
  const [settings, setSettings] = useState<PublicSettings>(() => ({
    ...DEFAULT_PUBLIC_SETTINGS,
    ...(initialSettings || {}),
  }));

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch {
      // Fallback silently to existing settings
    }
  }, []);

  useEffect(() => {
    refreshSettings();

    // Re-check on window focus so admin changes in another tab reflect immediately
    const handleFocus = () => refreshSettings();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): PublicSettings & { settings: PublicSettings; refreshSettings: () => Promise<void> } {
  const context = useContext(SettingsContext);
  const current = context?.settings || DEFAULT_PUBLIC_SETTINGS;
  return {
    ...current,
    settings: current,
    refreshSettings: context?.refreshSettings || (async () => {}),
  };
}

export function useSettingsContext(): SettingsContextType {
  return useContext(SettingsContext);
}
