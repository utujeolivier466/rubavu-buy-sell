import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const logoImage = new URL('./asset/logo.png', import.meta.url).href;

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappUrl = `https://wa.me/250782424382?text=${encodeURIComponent("Hello, I'm interested in properties in Gisenyi, Rugerero, Buhaza, or Kanembwe.")}`;

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/properties') {
      return location.pathname.startsWith('/properties');
    }
    return location.pathname === path;
  };

  const navButtonClass = (path: string) =>
    `text-sm font-medium transition-colors ${isActiveRoute(path) ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-700 hover:text-teal-600'}`;

  // For real, separate pages (Home, Properties, Contact, Sell) — always navigate.
  const goToPage = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  // For sections that only exist within the homepage (Lake Kivu Waterfront,
  // Resources, About) — scroll on home, otherwise navigate to home and
  // preserve the target through location state.
  const scrollToSection = (section: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToSection: section } });
      return;
    }

    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img src={logoImage} alt="Rubavu logo" className="h-16 w-auto rounded-md object-contain" />
            <div className="hidden md:block text-left">
              <div className="text-sm sm:text-base font-semibold text-gray-900">Rubavu Buy and Sell Ltd</div>
              <div className="text-xs sm:text-sm text-gray-600">Your Trusted Real Estate Partner</div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <button onClick={() => goToPage('/')} className={navButtonClass('/')}>Home</button>
            <button onClick={() => goToPage('/properties')} className={navButtonClass('/properties')}>Properties</button>
            <button onClick={() => scrollToSection('lakefront')} className="text-gray-700 hover:text-teal-600 transition-colors">Lake Kivu Waterfront</button>
            <button onClick={() => goToPage('/contact')} className={navButtonClass('/contact')}>Contact</button>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => goToPage('/sell-property')}
              className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Sell Your Property
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Chat via WhatsApp</span>
              <span className="lg:hidden">WhatsApp</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 flex flex-col gap-3">
            <button onClick={() => goToPage('/')} className={`${navButtonClass('/')} py-2 text-sm text-left`}>Home</button>
            <button onClick={() => goToPage('/properties')} className={`${navButtonClass('/properties')} py-2 text-sm text-left`}>Properties</button>
            <button onClick={() => scrollToSection('lakefront')} className="text-gray-700 hover:text-teal-600 py-2 text-sm text-left">Lake Kivu Waterfront</button>
            <button onClick={() => scrollToSection('resources')} className="text-gray-700 hover:text-teal-600 py-2 text-sm text-left">Resources</button>
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-teal-600 py-2 text-sm text-left">About Us</button>
            <button onClick={() => goToPage('/contact')} className={`${navButtonClass('/contact')} py-2 text-sm text-left`}>Contact</button>
            <button
              onClick={() => goToPage('/sell-property')}
              className="flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-600 px-4 py-2 rounded-lg w-full text-sm font-medium"
            >
              Sell Your Property
            </button>
            <div className="flex items-center gap-2 pt-2 text-sm">
              <Phone className="w-4 h-4" />
              <span>+250 782 424 382</span>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg w-full text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat via WhatsApp</span>
            </a>
          </nav>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-green-600 transition-colors"
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </header>
  );
}