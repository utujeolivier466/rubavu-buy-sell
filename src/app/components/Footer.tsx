import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Youtube } from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82c-1-.99-1.6-2.34-1.6-3.82h-3.13v14.02c0 1.55-1.26 2.8-2.8 2.8a2.8 2.8 0 1 1 0-5.6c.28 0 .55.04.8.12V9.99a6 6 0 1 0 5.13 5.94V9.4a8.2 8.2 0 0 0 4.6 1.4V7.68a4.85 4.85 0 0 1-3-1.86Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
              Rubavu Buy and Sell Ltd
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
              Your Trusted Real Estate Partner. Helping clients buy, sell, and invest in quality properties across Rubavu and beyond.
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-1 flex-shrink-0 text-teal-400" />
                <span>Habib Center, 1st Floor, Gisenyi, Rubavu, Rwanda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-teal-400" />
                <a href="tel:+250782424382" className="hover:text-teal-400 transition-colors">+250 782 424 382</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-teal-400" />
                <a href="mailto:info@rubavubuyandsell.com" className="hover:text-teal-400 transition-colors">info@rubavubuyandsell.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-teal-400" />
                <a href="https://www.rubavubuyandsell.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">
                  www.rubavubuyandsell.com
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Services</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="/properties" className="hover:text-teal-400 transition-colors">Buy Property</a></li>
              <li><a href="/sell-property" className="hover:text-teal-400 transition-colors">Sell Your Property</a></li>
              <li><a href="/properties" className="hover:text-teal-400 transition-colors">Property Listings</a></li>
              <li><a href="/contact" className="hover:text-teal-400 transition-colors">Property Valuation</a></li>
              <li><a href="/contact" className="hover:text-teal-400 transition-colors">Investment Advisory</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <li><a href="/about" className="hover:text-teal-400 transition-colors">About Us</a></li>
              <li><a href="/about#team" className="hover:text-teal-400 transition-colors">Our Team</a></li>
              <li><a href="/#testimonials" className="hover:text-teal-400 transition-colors">Testimonials</a></li>
              <li><a href="/sell-property" className="hover:text-teal-400 transition-colors">Sell Your Property</a></li>
              <li><a href="/faq" className="hover:text-teal-400 transition-colors">FAQs</a></li>
              <li><a href="/contact" className="hover:text-teal-400 transition-colors">Contact Us</a></li>
            </ul>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-bold mb-2 sm:mb-3 text-xs sm:text-sm">Follow Us</h4>
              <div className="flex gap-2 sm:gap-3">
                <a
                  href="https://www.facebook.com/p/Rubavu-buy-and-sell-Ltd-100054451151237/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://www.instagram.com/rubavu_real_estate"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@rubavu_real_estate"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <TikTokIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a
                  href="https://youtube.com/@Rubavurealestate"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-teal-400 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <div className="text-center md:text-left">
              © 2026 Rubavu Buy and Sell Ltd. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}