'use client';

import React, { useState, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import GoogleReCaptcha, { GoogleReCaptchaHandle } from '@/components/GoogleReCaptcha';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Calculator, 
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function ContactClient() {
  const settings = useSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Flooring Inquiry');
  const [department, setDepartment] = useState('carpets');
  const [sqft, setSqft] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<GoogleReCaptchaHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide your phone number.');
      return;
    }

    if (settings.recaptcha_enabled && settings.recaptcha_site_key && !captchaToken) {
      setError('Please complete the Google reCAPTCHA verification ("I am not a robot").');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: `[Contact Form] ${subject} (${department})`,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          quantity_sqft: sqft || undefined,
          message: `Subject: ${subject}\nDepartment: ${department}\n\nMessage:\n${message}`,
          captcha_token: captchaToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSubmittedInquiry(data.inquiry_number);
    } catch (err: any) {
      captchaRef.current?.reset();
      setCaptchaToken(null);
      setError(err.message || `Something went wrong. Please call us directly at ${settings.contact_phone || '(905) 848-2222'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1212ff] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#ff0000]" />
            <span>Showroom & Customer Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
            Contact Moga Carpet & Flooring
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Have questions about a commercial roll, carpet tile specifications, or in-home measurement? Reach out to our Brampton flooring specialists today.
          </p>
        </div>

        {/* 2-Column Grid: Contact Information & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Showroom Info & Operating Hours (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Cards */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
              <h3 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
                Brampton Showroom & Warehouse
              </h3>

              <div className="space-y-5 text-xs text-stone-600">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1212ff] flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-bold text-sm">Location Address</strong>
                    <span>{settings.contact_address || '1-8550 Torbram Road, Brampton ON, L6T 5J7'}</span>
                    <span className="block text-stone-400 mt-0.5">(Second Floor Showroom & Distribution)</span>
                    <a 
                      href={settings.google_maps_url || "https://maps.app.goo.gl/8pBrk8d4sy7C9vvG8"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-1 font-bold text-[#1212ff] hover:underline"
                    >
                      Open Google Maps Directions ↗
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-red-50 text-[#ff0000] flex-shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-bold text-sm">Phone Support</strong>
                    <a href={`tel:${(settings.contact_phone || '19058482222').replace(/[^0-9+]/g, '')}`} className="text-stone-800 hover:text-[#ff0000] font-semibold text-sm">
                      {settings.contact_phone || '(905) 848-2222'}
                    </a>
                    <span className="block text-stone-400">Call or Text anytime for immediate assistance</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1212ff] flex-shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-bold text-sm">Email Address</strong>
                    <a href={`mailto:${settings.contact_email || 'info@mogacarpet.ca'}`} className="text-stone-800 hover:text-[#1212ff] font-semibold">
                      {settings.contact_email || 'info@mogacarpet.ca'}
                    </a>
                    <span className="block text-stone-400">Quotes, plans, contractor blueprints</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-stone-100 text-stone-700 flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-bold text-sm">Operating Hours</strong>
                    <span>{settings.business_hours || 'Monday to Saturday: 11:00 AM – 5:00 PM'}</span>
                    <span className="block text-stone-400">Sunday: Closed (Available by special appointment)</span>
                  </div>
                </div>
              </div>

              {/* GTA Coverage Pill */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Installation Coverage Area:
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Brampton, Mississauga, Toronto, Vaughan, Oakville, Caledon, Milton, Georgetown, Markham & Richmond Hill.
                </p>
              </div>
            </div>

            {/* Quick Measurement Reminder */}
            <div className="bg-[#0b1026] text-white p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-[#ff4d4d] font-bold text-xs uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>Free In-Home Consultation</span>
              </div>
              <h4 className="text-base font-bold">Prefer we bring samples to you?</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Book a complimentary in-home visit anywhere in the GTA. We measure your rooms, assess subfloors, and provide on-the-spot quotes.
              </p>
              <a
                href={`tel:${(settings.contact_phone || '19058482222').replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] px-4 py-2 rounded-xl transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call to Schedule: {settings.contact_phone || '(905) 848-2222'}</span>
              </a>
            </div>

          </div>

          {/* RIGHT: Interactive Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
            {submittedInquiry ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-stone-900">Message Received!</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Reference Number: <span className="font-mono font-bold text-[#1212ff]">{submittedInquiry}</span>
                  </p>
                </div>
                <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name}</strong>! Your inquiry has been forwarded to our showroom team. We will review your request and get in touch with you shortly.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedInquiry(null);
                      setName('');
                      setEmail('');
                      setPhone('');
                      setMessage('');
                      setSqft('');
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#1212ff] text-white text-xs font-bold hover:bg-[#0a0ad8] transition-colors shadow-md"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="text-lg font-black text-stone-900">Send an Online Inquiry</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Fill out the form below and our team will get back to you with custom pricing and answers.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name <span className="text-[#ff0000]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gurpreet Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Phone Number <span className="text-[#ff0000]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. (905) 555-0143"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                    />
                  </div>
                </div>

                {/* Email & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address <span className="text-[#ff0000]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. customer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Flooring Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff] bg-white"
                    >
                      <option value="carpets">Carpets & Broadloom</option>
                      <option value="area-rugs">Area Rugs</option>
                      <option value="vinyl-flooring">Vinyl Flooring / SPC</option>
                      <option value="solid-hardwood">Solid Hardwood & Engineered</option>
                      <option value="stair-runner">Custom Stair Runner</option>
                      <option value="tiles">Tiles & Backsplashes</option>
                      <option value="countertop">Countertop & Mouldings</option>
                      <option value="underpad">Underpad & Cushion</option>
                    </select>
                  </div>
                </div>

                {/* Subject & Sq Ft */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Inquiry Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff] bg-white"
                    >
                      <option value="Product Pricing & Stock">Product Pricing & Stock</option>
                      <option value="Free In-Home Measurement">Free In-Home Measurement</option>
                      <option value="Commercial Contractor Quote">Commercial Contractor Quote</option>
                      <option value="Showroom Appointment">Book Showroom Appointment</option>
                      <option value="Custom Stair Runner">Custom Stair Runner</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Approx. Area (Square Feet)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 800 sq ft / 3 bedrooms"
                      value={sqft}
                      onChange={(e) => setSqft(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Message / Project Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your room dimensions, preferred carpet style, subfloor condition, or installation timeline..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-[#1212ff] focus:ring-1 focus:ring-[#1212ff]"
                  />
                </div>

                {/* reCAPTCHA Security */}
                {settings.recaptcha_enabled && settings.recaptcha_site_key && (
                  <div className="py-1">
                    <GoogleReCaptcha
                      ref={captchaRef}
                      siteKey={settings.recaptcha_site_key}
                      onChange={setCaptchaToken}
                    />
                  </div>
                )}

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span>Sending Your Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Moga Carpet</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-stone-400 text-center">
                  We reply within 1-2 business hours. Your details remain confidential.
                </p>
              </form>
            )}
          </div>

        </div>

        {/* Embedded Map Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-stone-900">Showroom Map & Directions</h3>
              <p className="text-xs text-stone-500">Located at Torbram Road & Steeles Avenue East in Brampton</p>
            </div>
            <a
              href="https://maps.app.goo.gl/8pBrk8d4sy7C9vvG8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#1212ff] hover:underline flex items-center gap-1"
            >
              <span>View Larger Map on Google</span>
              <span>↗</span>
            </a>
          </div>

          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-stone-200 relative bg-stone-100">
            <iframe
              title="Moga Carpet Showroom Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2884.288211915638!2d-79.6967568233481!3d43.69415447109968!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b3d168536f90d%3A0x6b4ef8d3c5caec02!2s8550%20Torbram%20Rd%2C%20Brampton%2C%20ON%20L6T%205J7!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
