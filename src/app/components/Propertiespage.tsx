import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';

interface Property {
  id: string;
  title: string;
  property_type: string;
  listing_type: string;
  status: string;
  price: number;
  currency: string;
  size_sqm: number;
  location_text: string;
  city: string;
  cover_image_url: string | null;
  image_urls: string[] | null;
  is_hot_deal: boolean;
  created_at: string;
}

function PropertiesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [suggested, setSuggested] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, [location.search]);

  async function fetchProperties() {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase is not configured');
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(location.search);
    let query = supabase.from('properties').select('*');

    // Don't filter by status initially - debug search issues first
    // Remove this line if you want strict status filtering
    // .eq('status', 'Available');

    const listingType = params.get('listing_type');
    const q = params.get('q');
    const city = params.get('city');
    const bedrooms = params.get('bedrooms');
    const minPrice = params.get('min_price');
    const maxPrice = params.get('max_price');
    const bathrooms = params.get('bathrooms');
    const type = params.get('type');
    const minSize = params.get('min_size');
    const sort = params.get('sort');

    if (listingType) query = query.eq('listing_type', listingType);
    if (city) query = query.eq('city', city);
    if (bedrooms) query = query.gte('bedrooms', Number(bedrooms));
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (bathrooms) query = query.gte('bathrooms', Number(bathrooms));
    if (type) query = query.eq('property_type', type);
    if (minSize) query = query.gte('size_sqm', Number(minSize));

    if (q) query = query.or(`title.ilike.%${q}%,location_text.ilike.%${q}%`);

    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error: queryError } = await query;

    if (queryError) {
      console.error('Property search failed:', queryError);
      setError('Something went wrong loading properties. Please try again.');
      setProperties([]);
    } else {
      setProperties(data || []);
      if ((data?.length || 0) === 0) {
        fetchSuggestions();
      } else {
        setSuggested([]);
      }
    }
    setLoading(false);
  }

  async function fetchSuggestions() {
    if (!supabase) return;

    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(4);

    if (data) setSuggested(data);
  }

  const activeFilterCount = new URLSearchParams(location.search).size;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {loading ? 'Searching…' : `${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'} Found`}
        </h1>
        {activeFilterCount > 0 && (
          <button
            onClick={() => navigate('/properties')}
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium mt-1"
          >
            Clear all filters
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-72" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="py-8">
          <div className="text-center mb-10">
            <p className="text-gray-500 text-lg mb-2">No properties match your search yet.</p>
            <p className="text-gray-400 text-sm">Try widening your filters, or take a look at these instead.</p>
          </div>

          {suggested.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">You might also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {suggested.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => navigate(`/properties/${property.id}`)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group text-left"
                  >
                    <div className="relative">
                      <img
                        src={Array.isArray(property.image_urls) && property.image_urls[0] ? property.image_urls[0] : property.cover_image_url || ''}
                        alt={property.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {property.is_hot_deal && (
                        <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                          Hot Deal
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{property.location_text}</p>
                      <p className="font-bold text-gray-900">
                        {property.currency} {Number(property.price).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-3">Looking for something specific? Tell us directly.</p>
            <a
              href="https://wa.me/250782424382"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium"
            >
              Ask us on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <button
              key={property.id}
              onClick={() => navigate(`/properties/${property.id}`)}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group text-left"
            >
              <div className="relative">
                <img
                  src={Array.isArray(property.image_urls) && property.image_urls[0] ? property.image_urls[0] : property.cover_image_url || ''}
                  alt={property.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {property.is_hot_deal && (
                  <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Hot Deal
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  {property.size_sqm ? `${property.size_sqm}SQM` : ''}
                </p>
                <p className="text-xs text-gray-500 mb-2">{property.location_text}</p>
                <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded mb-2">
                  {property.property_type}
                </span>
                <p className="font-bold text-gray-900">
                  {property.currency} {Number(property.price).toLocaleString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertiesPage;