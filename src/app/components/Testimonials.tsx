import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  attribution: string;
}

// Real reviews provided by the client. Attribution is intentionally generic
// (no invented names) since specific customer names weren't provided —
// update to real names/photos once available for stronger credibility.
const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Rubavu Buy and Sell Ltd made buying my property easy and secure. Highly recommended!',
    attribution: 'Verified Buyer',
  },
  {
    quote: 'Professional team, verified properties, and excellent customer service.',
    attribution: 'Verified Client',
  },
  {
    quote: 'I sold my property faster than expected. Thank you, Rubavu Buy and Sell Ltd!',
    attribution: 'Verified Seller',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            What Our Clients Say
          </h2>
          <p className="text-gray-600">Real feedback from buyers and sellers we've worked with</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <p className="text-xs font-medium text-gray-500">{t.attribution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}