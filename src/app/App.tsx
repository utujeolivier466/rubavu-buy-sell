import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturedProperties } from './components/FeaturedProperties';
import { WhyInvest } from './components/WhyInvest';
import { PropertySpecialties } from './components/PropertySpecialties';
import { Testimonials } from './components/Testimonials';
import { CTABanner } from './components/CTABanner';
import { Footer } from './components/Footer';
import Propertiespage from './components/Propertiespage';
import PropertyDetailPage from './components/PropertyDetailPage';
import Contactpage from './components/Contactpage';
import SellPropertyPage from './components/Sellpropertypage.tsx';
import { AuthProvider } from './context/Authcontext';
import ProtectedRoute from './components/ProtectedRoute';
import Adminlogin from './components/Adminlogin';
import Adminlayout from './components/Adminlayout';
import AdminProperties from './components/AdminProperties';
import Adminpropertyform from './components/Adminpropertyform';
import Admininquiries from './components/Admininquiries';
import AdminSubmissions from './components/Adminsubmissions';
import TermsPage from './components/Termspage';
import PrivacyPage from './components/Privacypage';

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const section = (location.state as any)?.scrollToSection as string | undefined;
    if (!section) return;

    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<Propertiespage />} />
        <Route path="/properties/:slug" element={<PropertyDetailPage />} />
        <Route path="/contact" element={<Contactpage />} />
        <Route path="/sell-property" element={<SellPropertyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Admin login has no public header/footer */}
        <Route path="/admin/login" element={<Adminlogin />} />

        {/* Protected admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Adminlayout />
            </ProtectedRoute>
          }
        >
          <Route path="properties" element={<AdminProperties />} />
          <Route path="properties/new" element={<Adminpropertyform />} />
          <Route path="properties/:id/edit" element={<Adminpropertyform />} />
          <Route path="inquiries" element={<Admininquiries />} />
          <Route path="submissions" element={<AdminSubmissions />} />
        </Route>

        {/* Public site */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;