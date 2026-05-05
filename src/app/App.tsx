import { Header } from './components/Header';
import PropertySearch from './components/HeroSection';
import { FeaturedProperties } from './components/FeaturedProperties';
import { WhyInvest } from './components/WhyInvest';
import { PropertySpecialties } from './components/PropertySpecialties';
import { Testimonials } from './components/Testimonials';
import { CTABanner } from './components/CTABanner';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PropertySearch />
      <FeaturedProperties />
      <WhyInvest />
      <PropertySpecialties />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}

export default App;
