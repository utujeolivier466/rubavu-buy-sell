import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Jean-Paul Mugabo",
    property: "Purchased 12,000 sqm lakefront land",
    quote: "Working with Rubavu Buy and Sell was seamless. They helped me find the perfect lakefront property for my eco-resort. The return on investment has exceeded my expectations.",
    rating: 5,
    avatar: "JPM"
  },
  {
    id: 2,
    name: "Sarah Williams",
    property: "Diaspora investor - Villa site",
    quote: "As a diaspora investor, I needed someone I could trust. The team provided complete transparency and handled all documentation professionally. My family now has a beautiful lakeside home.",
    rating: 5,
    avatar: "SW"
  },
  {
    id: 3,
    name: "David Nsengiyumva",
    property: "Commercial property - Rubavu Center",
    quote: "I've been investing in Rwandan real estate for years. This team understands the Rubavu market better than anyone. My commercial property value has increased 30% in just 18 months.",
    rating: 5,
    avatar: "DN"
  }
];

export function Testimonials() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            What Serious Buyers Say About Us
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Join 100+ satisfied investors who chose Rubavu Buy and Sell
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 sm:p-8 shadow-lg border border-gray-200 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 text-teal-200">
                <Quote className="w-8 h-8 sm:w-12 sm:h-12" fill="currentColor" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 relative z-10">
                "{testimonial.quote}"
              </p>

              {/* Client Info */}
              <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-gray-900">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{testimonial.property}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
