import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturedProperties } from './components/FeaturedProperties';
import { WhyInvest } from './components/WhyInvest';
import { PropertySpecialties } from './components/PropertySpecialties';
import { Testimonials } from './components/Testimonials';
import { CTABanner } from './components/CTABanner';
import { Footer } from './components/Footer';
import SEOHead from './components/Seohead';
import Propertiespage from './components/Propertiespage';
import PropertyDetailPage from './components/PropertyDetailPage';
import Contactpage from './components/Contactpage';
import SellPropertyPage from './components/Sellpropertypage.tsx';
import { AuthProvider } from './context/Authcontext';
import ProtectedRoute from './components/ProtectedRoute';
import Adminlogin from './components/Adminlogin';
import Adminlayout from './components/Adminlayout';
import AdminProperties from './components/Adminproperties';
import Adminpropertyform from './components/Adminpropertyform';
import Admininquiries from './components/Admininquiries';
import AdminSubmissions from './components/Adminsubmissions';
import TermsPage from './components/Termspage';
import PrivacyPage from './components/Privacypage';
import BlogListPage from './components/BlogListPage';
import BlogPostPage from './components/BlogPostPage';
import AboutPage from './components/Aboutpage';
import AdminBlog from './components/AdminBlog';
import AdminBlogForm from './components/AdminBlogForm';
import AdminAgents from './components/Adminagents';
import AdminAgentForm from './components/Adminagentform';

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
      <SEOHead
        title="Buy, Sell & Invest in Lake Kivu Properties"
        description="Rubavu's trusted real estate partner. Title-ready waterfront properties, houses, land, and commercial spaces in Gisenyi and across Rubavu District."
        url="/"
      />
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
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
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
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/new" element={<AdminBlogForm />} />
            <Route path="blog/:id/edit" element={<AdminBlogForm />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="agents/new" element={<AdminAgentForm />} />
            <Route path="agents/:id/edit" element={<AdminAgentForm />} />
          </Route>

          {/* Public site */}
          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;