import { Waves, Home, Building, Hotel, Mountain, ArrowRight } from 'lucide-react';

const specialties = [
  {
    id: 1,
    icon: Waves,
    title: "Lakefront Eco-Tourism Land",
    description: "Prime waterfront properties perfect for eco-resorts and tourism ventures"
  },
  {
    id: 2,
    icon: Home,
    title: "Waterfront Holiday Homes & Villas",
    description: "Luxury residential properties with stunning lake views"
  },
  {
    id: 3,
    icon: Building,
    title: "Commercial & Industrial Plots",
    description: "Strategic locations for border trade and business development"
  },
  {
    id: 4,
    icon: Hotel,
    title: "Boutique Hotel / Resort Sites",
    description: "Ready-to-develop hospitality properties in prime locations"
  },
  {
    id: 5,
    icon: Mountain,
    title: "Second Homes with Lake View",
    description: "Peaceful retreats with panoramic views of Lake Kivu"
  }
];

export function PropertySpecialties() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            What Type of Investment Are You Looking For?
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            We specialize in diverse property types to match your investment goals
          </p>
        </div>

        {/* Specialty Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {specialties.map((specialty) => {
            const Icon = specialty.icon;
            return (
              <div
                key={specialty.id}
                className="group bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#D56000]/40 cursor-pointer"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#D56000]/10 text-[#0D4F2A] rounded-lg flex items-center justify-center group-hover:bg-[#0D4F2A] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2">
                      {specialty.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      {specialty.description}
                    </p>
                    <div className="flex items-center gap-2 text-[#0D4F2A] group-hover:text-[#0A3B21] transition-colors">
                      <span className="text-xs sm:text-sm font-medium">Browse</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
