'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      ready: (callback: () => void) => void;
    };
    onGoogleReCaptchaLoadCallback?: () => void;
  }
}

export interface GoogleReCaptchaHandle {
  reset: () => void;
  getResponse: () => string;
}

interface GoogleReCaptchaProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
}

const SCRIPT_ID = 'google-recaptcha-script';

export const GoogleReCaptcha = forwardRef<GoogleReCaptchaHandle, GoogleReCaptchaProps>(
  function GoogleReCaptcha(
    { siteKey, onChange, onExpired, onError, theme = 'light', size = 'normal', className = '' },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);
    const [scriptReady, setScriptReady] = useState(false);

    // Expose reset and getResponse methods to parent via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (typeof window !== 'undefined' && window.grecaptcha && widgetIdRef.current !== null) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch {
            // Ignore reset error if unmounted
          }
        }
        onChange(null);
      },
      getResponse: () => {
        if (typeof window !== 'undefined' && window.grecaptcha && widgetIdRef.current !== null) {
          try {
            return window.grecaptcha.getResponse(widgetIdRef.current);
          } catch {
            return '';
          }
        }
        return '';
      },
    }));

    // Inject reCAPTCHA script once
    useEffect(() => {
      if (!siteKey) return;

      if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.render) {
        setScriptReady(true);
        return;
      }

      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const checkReady = () => {
        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
          setScriptReady(true);
        } else {
          setTimeout(checkReady, 100);
        }
      };

      script.addEventListener('load', checkReady);
      checkReady();

      return () => {
        script?.removeEventListener('load', checkReady);
      };
    }, [siteKey]);

    // Render widget into container
    useEffect(() => {
      if (!scriptReady || !siteKey || !containerRef.current) return;

      // Avoid re-rendering if already rendered in this container
      if (widgetIdRef.current !== null) return;

      try {
        containerRef.current.innerHTML = '';
        const id = window.grecaptcha!.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            onChange(token);
          },
          'expired-callback': () => {
            onChange(null);
            onExpired?.();
          },
          'error-callback': () => {
            onChange(null);
            onError?.();
          },
        });
        widgetIdRef.current = id;
      } catch (e) {
        console.warn('reCAPTCHA render notice:', e);
      }

      return () => {
        // Cleanup on unmount
        if (widgetIdRef.current !== null && window.grecaptcha) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch {
            // Ignore reset during unmount
          }
          widgetIdRef.current = null;
        }
      };
    }, [scriptReady, siteKey, theme, size, onChange, onExpired, onError]);

    if (!siteKey) {
      return null;
    }

    return (
      <div className={`recaptcha-wrapper flex justify-center my-3 overflow-x-auto ${className}`}>
        <div ref={containerRef} className="min-h-[78px] inline-block" />
      </div>
    );
  }
);

export default GoogleReCaptcha;
