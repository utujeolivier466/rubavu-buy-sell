import React, { useState } from "react";

export default function PropertySearch() {
  const [tab, setTab] = useState("sale");
  const [bedrooms, setBedrooms] = useState("any");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-4">
          {["sale", "rent"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                tab === t ? "bg-yellow-500 text-white" : "bg-gray-100"
              }`}
            >
              For {t}
            </button>
          ))}
        </div>

        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Enter an address, town, street"
            className="border rounded-lg p-3 w-full"
          />

          <select className="border rounded-lg p-3 w-full">
            <option>All Cities</option>
            <option>Kigali</option>
            <option>Huye</option>
          </select>

          <div className="flex gap-2 items-center">
            {["any", "2", "3", "4", "5+"].map((b) => (
              <button
                key={b}
                onClick={() => setBedrooms(b)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  bedrooms === b
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {b === "any" ? "Any" : b}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Min Price"
              className="border rounded-lg p-3"
            />
            <input
              placeholder="Max Price"
              className="border rounded-lg p-3"
            />

            <select className="border rounded-lg p-3">
              <option>Any Bathrooms</option>
              <option>1</option>
              <option>2</option>
              <option>3+</option>
            </select>

            <select className="border rounded-lg p-3">
              <option>All Types</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Land</option>
            </select>

            <div className="col-span-2">
              <p className="text-sm font-medium mb-2">Features</p>
              <div className="flex gap-4 text-sm">
                {["Pool", "Parking", "Garden"].map((f) => (
                  <label key={f} className="flex items-center gap-1">
                    <input type="checkbox" /> {f}
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-medium mb-2">Utilities</p>
              <div className="flex gap-4 text-sm">
                {["Electricity", "Water", "Internet"].map((u) => (
                  <label key={u} className="flex items-center gap-1">
                    <input type="checkbox" /> {u}
                  </label>
                ))}
              </div>
            </div>

            <input
              placeholder="Min Size (sqm)"
              className="border rounded-lg p-3"
            />

            <select className="border rounded-lg p-3">
              <option>Newest First</option>
              <option>Price Low to High</option>
              <option>Price High to Low</option>
            </select>
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 items-center text-sm">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="font-medium border px-3 py-1 rounded-lg"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {["All", "Apartment", "Commercial", "House", "Land"].map(
              (f) => (
                <button
                  key={f}
                  className="px-3 py-1 rounded-full bg-gray-100"
                >
                  {f}
                </button>
              )
            )}
          </div>

          <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold">
            Find Properties
          </button>
        </div>
      </div>
    </div>
  );
}
