import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturedProperties } from './components/FeaturedProperties';
import { WhyInvest } from './components/WhyInvest';
import { PropertySpecialties } from './components/PropertySpecialties';
import { Testimonials } from './components/Testimonials';
import { CTABanner } from './components/CTABanner';
import { Footer } from './components/Footer';
import PropertiesPage from './components/PropertiesPage';
import PropertyDetailPage from './components/PropertyDetailPage';

function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProperties />
      <WhyInvest />
      <PropertySpecialties />
      <Testimonials />
      <CTABanner />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:slug" element={<PropertyDetailPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;