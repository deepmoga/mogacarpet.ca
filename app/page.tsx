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
import { getActiveBanners } from '@/lib/banners';

export default async function HomePage() {
  const initialBanners = await getActiveBanners();

  return (
    <main className="min-h-screen flex flex-col bg-stone-50/50">
      <Navbar />
      <HeroSlider initialBanners={initialBanners} />
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
