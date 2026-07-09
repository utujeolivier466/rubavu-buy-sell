import { Routes, Route } from 'react-router-dom';
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
import { AuthProvider } from './context/Authcontext';
import ProtectedRoute from './components/ProtectedRoute';
import Adminlogin from './components/Adminlogin';
import Adminlayout from './components/Adminlayout';
import AdminProperties from './components/AdminProperties';
import Adminpropertyform from './components/Adminpropertyform';
import Admininquiries from './components/Admininquiries';

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

function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<Propertiespage />} />
        <Route path="/properties/:slug" element={<PropertyDetailPage />} />
        <Route path="/contact" element={<Contactpage />} />
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
        </Route>

        {/* Public site */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;