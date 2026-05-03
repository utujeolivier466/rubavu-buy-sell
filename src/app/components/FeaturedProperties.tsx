import { MessageCircle, MapPin, Maximize2 } from 'lucide-react';

const properties = [
  {
    id: 1,
    title: "1,393SQM Residential Building",
    image: new URL('./asset/house 1.png', import.meta.url).href,
    size: "1,393SQM",
    location: " RUGERERO, Rubavu",
    zoning: "Residential",
    price: "RWF 150M",
    projectedGain: "RWF 25M"
  },
  {
    id: 2,
    title: "450SQM Residential Building",
    image: new URL('./asset/house 2.png', import.meta.url).href,
    size: "450SQM",
    location: "Gisa, Rubavu",
    zoning: "Residential",
    price: "RWF 45M",
    projectedGain: "RWF 5M"
  },
  {
    id: 3,
    title: "520SQM Residential Building",
    image: new URL('./asset/house 3.png', import.meta.url).href,
    size: "520SQM",
    location: "Gisenyi, Rubavu",
    zoning: "Residential",
    price: "RWF 320M",
    projectedGain: "RWF 30M"
  },
  {
    id: 4,
    title: "650SQM Residential Building",
    image: new URL('./asset/house 4.png', import.meta.url).href,
    size: "650SQM",
    location: "Rubavu District",
    zoning: "Residential",
    price: "RWF 400M",
    projectedGain: "RWF 87M"
  }
];

export function FeaturedProperties() {
  return (
    <section id="properties" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Hot Opportunities in Rubavu Right Now
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Title-ready properties with high investment potential
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              {/* Property Image */}
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-amber-500 text-white text-xs px-2 sm:px-3 py-1 rounded-full">
                  Hot Deal
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 min-h-[3rem] sm:min-h-[3.5rem]">
                  {property.title}
                </h3>

                {/* Key Info */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 flex-shrink-0" />
                    <span>{property.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 flex-shrink-0" />
                    <span>{property.location}</span>
                  </div>
                  <div className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded inline-block">
                    {property.zoning}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{property.price}</div>
                  <div className="text-xs text-green-600 font-medium">
                    Projected 1-Year Gain: +{property.projectedGain}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-xs sm:text-sm">
                    View Details
                  </button>
                  <button className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
