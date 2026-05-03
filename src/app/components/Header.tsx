import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import logoImage from './asset/logo.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src={logoImage} alt="Rubavu logo" className="h-16 w-auto rounded-md object-contain" />
            <div className="hidden md:block text-left">
              <div className="text-sm sm:text-base font-semibold text-gray-900">Rubavu Buy and Sell Ltd</div>
              <div className="text-xs sm:text-sm text-gray-600">Lake Kivu Properties | Buy • Sell • Invest</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <a href="#home" className="text-gray-700 hover:text-teal-600 transition-colors">Home</a>
            <a href="#properties" className="text-gray-700 hover:text-teal-600 transition-colors">Properties</a>
            <a href="#lakefront" className="text-gray-700 hover:text-teal-600 transition-colors">Lake Kivu Waterfront</a>
            <a href="#investment" className="text-gray-700 hover:text-teal-600 transition-colors">Investment Opportunities</a>
            <a href="#resources" className="text-gray-700 hover:text-teal-600 transition-colors">Resources</a>
            <a href="#about" className="text-gray-700 hover:text-teal-600 transition-colors">About Us</a>
            <a href="#contact" className="text-gray-700 hover:text-teal-600 transition-colors">Contact</a>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <div className="hidden lg:flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4" />
              <span className="text-sm">+250 782 424 382</span>
            </div>
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Chat on WhatsApp</span>
              <span className="lg:hidden">WhatsApp</span>
            </button>
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
            <a href="#home" className="text-gray-700 hover:text-teal-600 py-2 text-sm">Home</a>
            <a href="#properties" className="text-gray-700 hover:text-teal-600 py-2 text-sm">Properties</a>
            <a href="#lakefront" className="text-gray-700 hover:text-teal-600 py-2 text-sm">Lake Kivu Waterfront</a>
            <a href="#investment" className="text-gray-700 hover:text-teal-600 py-2 text-sm">Investment Opportunities</a>
            <a href="#resources" className="text-gray-700 hover:text-teal-600 py-2 text-sm">Resources</a>
            <a href="#about" className="text-gray-700 hover:text-teal-600 py-2 text-sm">About Us</a>
            <a href="#contact" className="text-gray-700 hover:text-teal-600 py-2 text-sm">Contact</a>
            <div className="flex items-center gap-2 pt-2 text-sm">
              <Phone className="w-4 h-4" />
              <span>+250 782 424 382</span>
            </div>
            <button className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg w-full text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </button>
          </nav>
        )}
      </div>

      {/* Floating WhatsApp Button (Mobile) */}
      <button className="fixed bottom-6 right-6 lg:hidden bg-green-500 text-white p-4 rounded-full shadow-lg z-50 hover:bg-green-600 transition-colors">
        <MessageCircle className="w-6 h-6" />
      </button>
    </header>
  );
}
