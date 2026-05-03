import { useState } from 'react';

export function HeroSection() {
  const [tab, setTab] = useState('sale');
  const [bedrooms, setBedrooms] = useState('any');

  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1580835018727-6a6971c2223d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbGFrZSUyMHNjZW5pYyUyMHZpZXclMjBtb3VudGFpbnN8ZW58MXx8fHwxNzc3NDU3NjY0fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Lake Kivu sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-8 sm:py-12">
        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4">
          Own a Piece of <span className="text-amber-400">Lake Kivu Paradise</span>
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Before Prices Rise
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto">
          Waiting 12 months could cost you <span className="font-bold text-amber-300">RWF 50M – 150M+</span> in lost equity.
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Tourism is booming. Infrastructure is ready. The time is now.
        </p>

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="bg-white shadow-xl rounded-2xl p-5 sm:p-6 space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setTab('sale')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  tab === 'sale' ? 'bg-yellow-500 text-white' : 'bg-gray-100'
                }`}
              >
                For Sale
              </button>
              <button
                onClick={() => setTab('rent')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  tab === 'rent' ? 'bg-yellow-500 text-white' : 'bg-gray-100'
                }`}
              >
                For Rent
              </button>
            </div>

            {/* Inputs Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Enter address, town, street"
                className="border rounded-lg p-3 w-full"
              />

              <select className="border rounded-lg p-3 w-full">
                <option>All Cities</option>
                <option>Rubavu</option>
                <option>Musanze</option>
              </select>

              <div className="flex flex-wrap gap-2 items-center">
                {['any', '2', '3', '4', '5+'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBedrooms(b)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      bedrooms === b ? 'bg-yellow-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {b === 'any' ? 'Any' : b}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters + CTA */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="font-medium">Show Filters</span>
                {['All', 'Apartment', 'Commercial', 'House', 'Land'].map((f) => (
                  <button key={f} className="px-3 py-1 rounded-full bg-gray-100 whitespace-nowrap">
                    {f}
                  </button>
                ))}
              </div>

              <button className="w-full md:w-auto bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold">
                Find Properties
              </button>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-4 sm:mb-6">
          <button className="px-6 sm:px-8 py-2 sm:py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm sm:text-base font-medium">
            Browse All Properties
          </button>
          <button className="px-6 sm:px-8 py-2 sm:py-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-lg transition-colors text-sm sm:text-base font-medium">
            Download Free Investment Guide
          </button>
        </div>

        {/* Trust Line */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-200">
          <span>✓ Title-Ready Listings</span>
          <span>✓ 100+ Happy Investors</span>
          <span>✓ Located in Gisenyi</span>
        </div>
      </div>
    </section>
  );
}
