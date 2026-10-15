import Navbar from '@/components/Navbar';
import HeroSlider from '@/components/HeroSlider';
import TrustBadges from '@/components/TrustBadges';
import CategoryGrid from '@/components/CategoryGrid';
import ProductShowcase from '@/components/ProductShowcase';
import FlooringEstimator from '@/components/FlooringEstimator';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import ShowroomVisit from '@/components/ShowroomVisit';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-stone-50/50">
      <Navbar />
      <HeroSlider />
      <TrustBadges />
      <CategoryGrid />
      <ProductShowcase />
      <FlooringEstimator />
      <WhyChooseUs />
      <Testimonials />
      <ShowroomVisit />
      <Footer />
    </main>
  );
}
