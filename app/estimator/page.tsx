import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FlooringEstimator from '@/components/FlooringEstimator';

export const metadata: Metadata = {
  title: 'Flooring Cost Estimator | Moga Carpet & Flooring Brampton',
  description: 'Use our free interactive flooring estimator to calculate carpet, vinyl, hardwood, and laminate costs for your room. Get an instant estimate in seconds — no obligation.',
};

export default function EstimatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b1026]">
      {/* Header Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* Hero band */}
        <div className="bg-[#0b1026] text-white text-center py-12 sm:py-16 px-4 border-b border-[#182046]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8585ff] mb-3">Free Interactive Tool</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">Flooring Cost Estimator</h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Select your square footage, flooring type, quality tier, and service level to see your factory-direct quote instantly.
          </p>
        </div>

        {/* Estimator widget */}
        <FlooringEstimator />

        {/* Trust strip */}
        <div className="bg-white py-12 px-4 border-t border-stone-200">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-sm">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="text-3xl mb-2">🔒</div>
              <p className="font-bold text-stone-900">Zero Obligation</p>
              <p className="text-stone-500 text-xs mt-1">Your estimate is 100% free with no sales pressure</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="text-3xl mb-2">📐</div>
              <p className="font-bold text-stone-900">Laser-Accurate Measure</p>
              <p className="text-stone-500 text-xs mt-1">We confirm dimensions in-home across the GTA before invoice</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="text-3xl mb-2">🚚</div>
              <p className="font-bold text-stone-900">Direct Mill Pricing</p>
              <p className="text-stone-500 text-xs mt-1">50,000 sq ft warehouse in Brampton — wholesale GTA rates</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
