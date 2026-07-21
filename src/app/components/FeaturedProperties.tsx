import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Maximize2 } from 'lucide-react';
import { supabase } from '../../../lib/libsupabaseClient';

const WHATSAPP_NUMBER = '250782424382';

const fallbackProperties = [
  {
    id: 1,
    slug: '1393sqm-residential-building-rugerero',
    title: '1,393SQM Residential Building',
    image: new URL('./asset/house 1.png', import.meta.url).href,
    size: '1,393SQM',
    location: 'RUGERERO, Rubavu',
    zoning: 'Residential',
    price: 'RWF 150M',
    projectedGain: 'RWF 25M',
    status: 'Available',
  },
  {
    id: 2,
    slug: '450sqm-residential-building-gisa',
    title: '450SQM Residential Building',
    image: new URL('./asset/house 2.png', import.meta.url).href,
    size: '450SQM',
    location: 'Gisa, Rubavu',
    zoning: 'Residential',
    price: 'RWF 45M',
    projectedGain: 'RWF 5M',
    status: 'Available',
  },
  {
    id: 3,
    slug: '520sqm-residential-building-gisenyi',
    title: '520SQM Residential Building',
    image: new URL('./asset/house 3.png', import.meta.url).href,
    size: '520SQM',
    location: 'Gisenyi, Rubavu',
    zoning: 'Residential',
    price: 'RWF 320M',
    projectedGain: 'RWF 30M',
    status: 'Available',
  },
  {
    id: 4,
    slug: '650sqm-residential-building-rubavu-district',
    title: '650SQM Residential Building',
    image: new URL('./asset/house 4.png', import.meta.url).href,
    size: '650SQM',
    location: 'Rubavu District',
    zoning: 'Residential',
    price: 'RWF 400M',
    projectedGain: 'RWF 87M',
    status: 'Available',
  },
];

function formatPrice(value: string | null | undefined) {
  if (value === null || value === undefined || value === '') return 'Price on request';

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    return `RWF ${numericValue.toLocaleString()}`;
  }

  return String(value);
}

function mapProperty(property: { slug: any; status: any; cover_image_url: any; image_urls: string | any[]; image_url: any; image: any; photo_url: any; id: any; title: any; name: any; property_title: any; size_sqm: any; size: any; city: any; location: any; property_type: any; category: any; price: string | null | undefined; projected_gain: any; }) {
  const getImageUrl = () => {
    if (property.cover_image_url) return property.cover_image_url;
    if (Array.isArray(property.image_urls) && property.image_urls.length > 0) {
      return property.image_urls[0];
    }
    if (property.image_url) return property.image_url;
    if (property.image) return property.image;
    if (property.photo_url) return property.photo_url;
    return fallbackProperties[0].image;
  };

  return {
    id: property.id,
    slug: property.slug || property.id,
    status: property.status || 'Available',
    title: property.title || property.name || property.property_title || 'Luxury Property in Rubavu',
    image: getImageUrl(),
    size: property.size_sqm
      ? `${Number(property.size_sqm).toLocaleString()} SQM`
      : property.size || 'Size available on request',
    location: property.city || property.location || 'Rubavu District, Rwanda',
    zoning: property.property_type || property.category || 'Property',
    price: formatPrice(property.price),
    projectedGain: property.projected_gain
      ? `RWF ${Number(property.projected_gain).toLocaleString()}`
      : 'Contact us for details',
  };
}

export function FeaturedProperties() {
  const [properties, setProperties] = useState(fallbackProperties);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMockData, setIsMockData] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedProperties = async () => {
      if (!supabase) {
        setError('Supabase is not configured yet. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('is_featured', true)
          .in('status', ['Available', 'Pending'])
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (error) {
          console.error('Error fetching featured properties:', error);
          setError('Unable to load featured properties right now.');
          setProperties(fallbackProperties);
          setIsMockData(true);
          return;
        }

        if (data?.length) {
          setProperties(data.map(mapProperty));
          setIsMockData(false);
        } else {
          setProperties(fallbackProperties);
          setIsMockData(true);
        }
      } catch (err) {
        console.error('Featured properties fetch failed:', err);
        if (isMounted) {
          setError('Unable to load featured properties right now.');
          setProperties(fallbackProperties);
          setIsMockData(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeaturedProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleQuickWhatsApp(property: { id: any; title: string; location: string; price: string; status?: string }) {
    if (!isMockData && supabase) {
      supabase.from('inquiries').insert({
        property_id: property.id,
        source: 'whatsapp',
        message: `Quick inquiry from homepage: ${property.title}`,
      }).then(({ error }) => {
        if (error) console.error('Inquiry log failed (non-blocking):', error);
      });
    }

    const message = encodeURIComponent(
      `Hi, I'm interested in "${property.title}" (${property.location}) listed at ${property.price}. Is it still available?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  }

  function getBadge(property: { status?: string; listing_type?: string }) {
    if (property.status === 'Sold') return { label: 'Sold', className: 'bg-[#0D4F2A] text-white' };
    if (property.status === 'Rented') return { label: 'Rented', className: 'bg-[#D56000] text-white' };
    if (property.status === 'Pending') return { label: 'Pending', className: 'bg-[#0D4F2A]/10 text-[#0D4F2A] border border-[#0D4F2A]/20' };
    const label = property.listing_type === 'Rent' ? 'For Rent' : 'For Sale';
    return { label, className: 'bg-[#D56000] text-white' };
  }

  return (
    <section id="properties" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Hot Opportunities in Rubavu Right Now
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Title-ready properties with high investment potential
          </p>
        </div>

        {loading && (
          <div className="mb-4 text-center text-sm text-gray-600">Loading featured properties…</div>
        )}

        {error && (
          <div className="mb-4 text-center text-sm text-red-600">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {properties
            .filter((property) => property.status !== 'Sold' && property.status !== 'Rented')
            .map((property) => {
            const isUnavailable = false;
            const badge = getBadge(property);

            return (
              <div key={property.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${isUnavailable ? 'grayscale-[40%]' : ''}`}
                  />
                  <div className={`absolute top-3 right-3 text-sm font-semibold px-3 py-1.5 rounded-none uppercase tracking-wide shadow-md ${badge.className}`}>
                    {badge.label}
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 min-h-[3rem] sm:min-h-[3.5rem]">
                    {property.title}
                  </h3>

                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#0D4F2A] flex-shrink-0" />
                      <span>{property.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#0D4F2A] flex-shrink-0" />
                      <span>{property.location}</span>
                    </div>
                    <div className="text-xs bg-[#0D4F2A]/10 text-[#0D4F2A] px-2 py-1 rounded inline-block">
                      {property.zoning}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{property.price}</div>
                    {!isUnavailable && (
                      <div className="text-xs text-[#D56000] font-medium">
                        Projected 1-Year Gain: +{property.projectedGain}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/properties/${property.slug}`}
                      className="flex-1 px-3 sm:px-4 py-2 bg-[#0D4F2A] hover:bg-[#0A3B21] text-white rounded-lg transition-colors text-xs sm:text-sm text-center"
                    >
                      View Details
                    </Link>
                    {!isUnavailable && (
                      <button
                        onClick={() => handleQuickWhatsApp(property)}
                        className="px-3 sm:px-4 py-2 bg-[#D56000] hover:bg-[#D56000] text-white rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
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