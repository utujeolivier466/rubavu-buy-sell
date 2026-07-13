import { TrendingUp, Building2, Calculator } from 'lucide-react';

export function WhyInvest() {
  return (
    <section id="investment" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            The Real Cost of Waiting
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Every month you delay could mean significant lost opportunity
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Tourism Boom */}
          <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#0D4F2A] text-white rounded-full mb-3 sm:mb-4">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Tourism Boom</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Record visitors & revenue growth in Rubavu. Lake Kivu is becoming Rwanda's premier tourist destination with year-over-year increases.
            </p>
          </div>

          {/* Infrastructure Ready */}
          <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-amber-600 text-white rounded-full mb-3 sm:mb-4">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Infrastructure Ready</h3>
            <p className="text-sm sm:text-base text-gray-600">
              New Port + Rubavu 2050 Master Plan is transforming the region. Major developments are already underway.
            </p>
          </div>

          {/* Lost Money */}
          <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-rose-50 to-white rounded-xl border border-rose-100">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-rose-600 text-white rounded-full mb-3 sm:mb-4">
              <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Lost Money</h3>
            <div className="bg-white border-2 border-rose-200 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Buy today at</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">500M RWF</div>
              <div className="my-2 border-t border-gray-300"></div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Could be next year</div>
              <div className="text-xl sm:text-2xl font-bold text-[#D56000]">625M+ RWF</div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              That's 125M+ in potential equity gain
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#0D4F2A] hover:bg-[#0A3B21] text-white text-base sm:text-lg rounded-lg transition-colors shadow-lg">
            Calculate Your Potential Gain
          </button>
        </div>
      </div>
    </section>
  );
}
