import { useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturedProperties } from './components/FeaturedProperties';
import { WhyInvest } from './components/WhyInvest';
import { PropertySpecialties } from './components/PropertySpecialties';
import { Testimonials } from './components/Testimonials';
import { CTABanner } from './components/CTABanner';
import { Footer } from './components/Footer';
import PropertiesPage from './components/Propertiespage';

function App() {
  const location = useLocation();
  const isPropertiesPage = location.pathname.startsWith('/properties');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {isPropertiesPage ? (
        <PropertiesPage />
      ) : (
        <>
          <HeroSection />
          <FeaturedProperties />
          <WhyInvest />
          <PropertySpecialties />
          <Testimonials />
          <CTABanner />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
