import { useState } from 'react';

function PropertySearch() {
  const [tab, setTab] = useState("sale");
  const [bedrooms, setBedrooms] = useState("any");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="w-full px-3 py-4 sm:px-4 lg:px-0 lg:max-w-6xl lg:mx-auto">
      <div className="bg-white shadow-xl rounded-lg sm:rounded-2xl p-3 sm:p-6 space-y-3 sm:space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          {["sale", "rent"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium capitalize text-sm sm:text-base transition-colors ${
                tab === t ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              For {t}
            </button>
          ))}
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          <input
            type="text"
            placeholder="Enter an address, town, street"
            className="border border-gray-300 rounded-lg p-2.5 sm:p-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <select className="border border-gray-300 rounded-lg p-2.5 sm:p-3 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option>All Cities</option>
            <option>Kigali</option>
            <option>Huye</option>
          </select>

          <div className="flex gap-1 sm:gap-2 items-center overflow-x-auto pb-2 sm:pb-0">
            {["any", "2", "3", "4", "5+"].map((b) => (
              <button
                key={b}
                onClick={() => setBedrooms(b)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  bedrooms === b
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {b === "any" ? "Any" : b}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <input
              placeholder="Min Price"
              className="border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              placeholder="Max Price"
              className="border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <select className="border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Any Bathrooms</option>
              <option>1</option>
              <option>2</option>
              <option>3+</option>
            </select>

            <select className="border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>All Types</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Land</option>
            </select>

            <div className="sm:col-span-2 lg:col-span-2">
              <p className="text-xs sm:text-sm font-medium mb-2">Features</p>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                {["Pool", "Parking", "Garden"].map((f) => (
                  <label key={f} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer" /> {f}
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <p className="text-xs sm:text-sm font-medium mb-2">Utilities</p>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                {["Electricity", "Water", "Internet"].map((u) => (
                  <label key={u} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer" /> {u}
                  </label>
                ))}
              </div>
            </div>

            <input
              placeholder="Min Size (sqm)"
              className="border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <select className="border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Newest First</option>
              <option>Price Low to High</option>
              <option>Price High to Low</option>
            </select>
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="font-medium border border-gray-300 px-3 py-2 sm:py-1.5 rounded-lg text-sm sm:text-base hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            <div className="flex gap-1.5 sm:gap-2 items-center overflow-x-auto pb-2 sm:pb-0">
              {["All", "Apartment", "Commercial", "House", "Land"].map(
                (f) => (
                  <button
                    key={f}
                    className="px-2.5 sm:px-3 py-1 rounded-full bg-gray-100 text-xs sm:text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition-colors"
                  >
                    {f}
                  </button>
                )
              )}
            </div>
          </div>

          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors w-full sm:w-auto">
            Find Properties
          </button>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen sm:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden">
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
      <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 text-center py-6 sm:py-12 lg:py-16">
        {/* Main Headline */}
        <h1 className="text-xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
          Own a Piece of <span className="text-amber-400">Lake Kivu Paradise</span>
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Before Prices Rise
        </h1>

        {/* Sub-headline */}
        <p className="text-xs sm:text-base lg:text-lg text-gray-200 mb-4 sm:mb-6 lg:mb-8 max-w-3xl mx-auto leading-relaxed">
          Waiting 12 months could cost you <span className="font-bold text-amber-300">RWF 50M – 150M+</span> in lost equity.
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Tourism is booming. Infrastructure is ready. The time is now.
        </p>

        <PropertySearch />


        {/* CTAs */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 lg:gap-4 justify-center mb-4 sm:mb-6 lg:mb-8">
          <button className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-xs sm:text-sm lg:text-base font-medium w-full sm:w-auto">
            Browse All Properties
          </button>
          <button className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-lg transition-colors text-xs sm:text-sm lg:text-base font-medium w-full sm:w-auto">
            Download Free Investment Guide
          </button>
        </div>

        {/* Trust Line */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-200">
          <span>✓ Title-Ready Listings</span>
          <span>✓ 100+ Happy Investors</span>
          <span>✓ Located in Gisenyi</span>
        </div>
      </div>
    </section>
  );
}
