'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { MapPin, Phone, Clock, Calendar, CheckCircle, Navigation, ArrowRight } from 'lucide-react';

export default function ShowroomVisit() {
  const settings = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    interest: 'Carpet & Underpad',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          city: 'Brampton Showroom',
          category: formData.interest,
          service_type: 'Showroom VIP Appointment',
          notes: `Preferred Date: ${formData.date} | Notes: ${formData.notes}`,
        }),
      });
    } catch (err) {
      console.error(err);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        date: '',
        interest: 'Carpet & Underpad',
        notes: '',
      });
    }, 4000);
  };

  return (
    <section id="showroom-section" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Showroom Info & Map */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-[#0b1026] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#182046]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1212ff]/20 text-[#8585ff] border border-[#1212ff]/40 text-xs font-bold uppercase tracking-wider mb-4">
                <MapPin className="w-3.5 h-3.5 text-[#ff0000]" />
                <span>Visit Our Brampton Showroom</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Touch & Feel Premium Textures in Person
              </h2>

              <p className="text-stone-300 text-sm leading-relaxed mb-8 font-light">
                Explore thousands of full-size broadloom carpet rolls, wool rugs, commercial carpet tiles, and scratch-tested waterproof vinyl planks with our master flooring specialists.
              </p>

              {/* Contact Details */}
              <div className="space-y-4 text-sm text-stone-200 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#182046] text-[#4d4dff] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold">Showroom Address</strong>
                    <span>{settings.contact_address || '1-8550 Torbram Road, Brampton, ON, Canada'}</span>
                    <span className="block text-stone-400 text-xs">(Second Floor • Free Customer Parking)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#182046] text-[#ff4d4d] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold">Direct Call or Text</strong>
                    <a href={`tel:${(settings.contact_phone || '19058482222').replace(/[^0-9+]/g, '')}`} className="text-[#ff4d4d] hover:underline font-bold text-base">
                      {settings.contact_phone || '1-905-848-2222'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#182046] text-[#4d4dff] flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-white font-semibold">Hours of Operation</strong>
                    <span>{settings.business_hours || 'Monday to Saturday: 11:00 AM – 5:00 PM'}</span>
                    <span className="block text-[#4d4dff] text-xs font-semibold">Preferred by Appointment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Button */}
            <div className="pt-6 border-t border-[#182046] flex flex-wrap gap-4">
              <a
                href={settings.google_maps_url || "https://maps.app.goo.gl/8pBrk8d4sy7C9vvG8"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1212ff] hover:bg-[#0a0ad8] text-white font-bold text-xs transition-colors shadow-md gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps</span>
              </a>

              <a
                href={`tel:${(settings.contact_phone || '19058482222').replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[#ff0000] text-white hover:bg-[#ff0000]/20 font-bold text-xs transition-colors"
              >
                <span>Call {settings.contact_phone || '(905) 848-2222'}</span>
              </a>
            </div>

          </div>

          {/* Right Column: Appointment Booking Form */}
          <div className="lg:col-span-6 bg-stone-50 border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1212ff] uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4 text-[#ff0000]" />
                <span>Priority VIP Booking</span>
              </div>

              <h3 className="text-2xl font-bold text-stone-900 mb-2">
                Book a Private Showroom Consultation
              </h3>
              <p className="text-stone-500 text-xs mb-6">
                Reserve dedicated time with a senior flooring consultant. We will have custom samples and pricing ready for your arrival.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-lg text-stone-900">Showroom VIP Pass Confirmed!</h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    Thank you! We've reserved your slot and sent confirmation details. See you at {settings.contact_address || 'our showroom'}!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(905) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Primary Interest
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff] cursor-pointer"
                    >
                      <option value="Residential Carpet & Underpad">Residential Plush & Saxony Carpets</option>
                      <option value="Commercial Carpet Loop & Tiles">Commercial Carpet Tiles & Rolls</option>
                      <option value="Waterproof Click SPC Vinyl">100% Waterproof SPC Luxury Vinyl Planks</option>
                      <option value="Ancient Garden Luxury Rugs">Ancient Garden Designer Area Rugs</option>
                      <option value="Custom Stair Runners">Custom Stair Runners & Binding</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Project Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Bringing room measurements, need pet-friendly flooring..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-[#1212ff]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#ff0000] hover:bg-[#cc0000] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Reserve VIP Appointment (Free)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="pt-4 text-center">
              <span className="text-[11px] text-stone-500">
                Prefer immediate help? Call our showroom directly at <a href={`tel:${(settings.contact_phone || '19058482222').replace(/\D/g, '')}`} className="text-[#1212ff] font-bold underline">{settings.contact_phone || '(905) 848-2222'}</a>
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
