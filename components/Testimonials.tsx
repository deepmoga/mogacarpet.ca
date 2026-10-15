import React from 'react';
import { Star, Quote, CheckCircle, MapPin } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Gurpreet S.',
    location: 'Brampton, ON',
    rating: 5,
    title: 'Outstanding carpet installation in our 4-bedroom home',
    comment: 'We visited their Torbram Road showroom and were blown away by the selection. They helped us choose a textured saxony carpet with the 12mm memory foam underpad. The installers arrived right at 8:30 AM, moved furniture with great care, and the seams are completely invisible. Highly recommend!',
    project: 'Full House Carpet & Underpad',
    verified: true,
  },
  {
    id: 2,
    name: 'David & Rachel M.',
    location: 'Mississauga, ON',
    rating: 5,
    title: 'Waterproof SPC vinyl planks transformed our basement',
    comment: 'After a minor flood we wanted 100% waterproof flooring. Moga Carpet had the Back Street commercial click tiles in stock. Delivered the next day and installed over the weekend. Feels super solid underfoot and looks like real stone travertine.',
    project: '1,200 Sq Ft Basement Vinyl Planks',
    verified: true,
  },
  {
    id: 3,
    name: 'Manjit K.',
    location: 'Vaughan, ON',
    rating: 5,
    title: 'Custom Ancient Garden Rug for our formal living room',
    comment: 'The quality of the Ancient Garden medallion rug is breathtaking. The colors and silk sheen change beautifully under warm lighting. Great wholesale pricing and friendly family-owned service!',
    project: 'Ancient Garden 9x12 Living Room Rug',
    verified: true,
  },
  {
    id: 4,
    name: 'Robert T., Property Manager',
    location: 'Toronto (GTA), ON',
    rating: 5,
    title: 'Our go-to supplier for commercial carpet tiles',
    comment: 'We manage three commercial office towers. Moga Carpet supplies all our 20x20 modular carpet tiles. Quick turnaround, direct mill pricing that beats every other quote in the GTA, and always reliable.',
    project: 'Commercial Office Towers',
    verified: true,
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-stone-50/70 border-t border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1212ff] text-xs font-bold uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 fill-[#1212ff] text-[#1212ff]" />
            <span>Customer Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Trusted by Hundreds of GTA Homeowners & Contractors
          </h2>
          <p className="mt-2 text-stone-600 text-sm sm:text-base">
            Rated 4.9/5 Stars on Google Reviews for carpet selection, punctuality, and flawless craftsmanship.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-stone-200" />
                </div>

                {/* Title */}
                <h3 className="font-bold text-stone-900 text-sm mb-2 leading-snug">
                  "{review.title}"
                </h3>

                {/* Comment */}
                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  {review.comment}
                </p>
              </div>

              {/* Author & Verification */}
              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">{review.name}</h4>
                    <div className="flex items-center text-[11px] text-stone-500">
                      <MapPin className="w-3 h-3 mr-1 text-stone-400" />
                      <span>{review.location}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Verified
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
