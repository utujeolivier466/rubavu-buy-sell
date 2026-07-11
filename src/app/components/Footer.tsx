import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
              Rubavu Buy and Sell Ltd
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
              Lake Kivu's trusted real estate partner. Connecting serious investors with premium waterfront properties since 2015.
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-1 flex-shrink-0 text-teal-400" />
                <span>Gisenyi, Rubavu District, Rwanda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-teal-400" />
                <span>+250 782 424 382</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-teal-400" />
                <span>info@rubavubuysell.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Properties</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Lakefront Land</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Residential Villas</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Commercial Plots</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Resort Sites</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Featured Listings</a></li>
            </ul>
          </div>

          {/* Investment */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Investment</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Why Rubavu</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Market Analysis</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Investment Guide</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">ROI Calculator</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Diaspora Services</a></li>
            </ul>
          </div>

          {/* Resources & About */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <li><a href="/about" className="hover:text-teal-400 transition-colors">About Us</a></li>
              <li><a href="/about#team" className="hover:text-teal-400 transition-colors">Our Team</a></li>
              <li><a href="/" className="hover:text-teal-400 transition-colors">Testimonials</a></li>
              <li><a href="/contact" className="hover:text-teal-400 transition-colors">Contact</a></li>
            </ul>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-bold mb-2 sm:mb-3 text-xs sm:text-sm">Follow Us</h4>
              <div className="flex gap-2 sm:gap-3">
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <div className="text-center md:text-left">
              © 2026 Rubavu Buy and Sell Ltd. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
